import type { Server, Socket } from "socket.io";
import { GameManager } from "./game.js";
import type {
  CreateGameAck,
  HostRejoinAck,
  JoinGameAck,
  PlayerRejoinAck,
  SubmitAnswerAck,
} from "./types.js";

interface SocketData {
  role?: "host" | "player" | "projector";
  code?: string;
  teamId?: string;
}

function roomName(code: string) {
  return `game:${code}`;
}

export function registerSocketHandlers(io: Server) {
  const manager = new GameManager({
    onStateChange: (code) => {
      const game = manager.getGame(code);
      if (!game) return;
      io.to(roomName(code)).emit("game:state", game.getPublicState());
    },
  });

  io.on("connection", (socket: Socket) => {
    const data = socket.data as SocketData;

    // ── Host ────────────────────────────────────────────────────────

    socket.on("host:createGame", (_payload, ack: (res: CreateGameAck) => void) => {
      const game = manager.createGame();
      game.hostSocketId = socket.id;
      data.role = "host";
      data.code = game.code;
      socket.join(roomName(game.code));
      ack({ success: true, code: game.code, hostToken: game.hostToken });
      io.to(roomName(game.code)).emit("game:state", game.getPublicState());
    });

    socket.on(
      "host:rejoin",
      (payload: { code: string; hostToken: string }, ack: (res: HostRejoinAck) => void) => {
        const game = manager.getGame(payload.code);
        if (!game) return ack({ success: false, error: "Game not found." });
        if (game.hostToken !== payload.hostToken) {
          return ack({ success: false, error: "Not authorized as host." });
        }
        game.hostSocketId = socket.id;
        data.role = "host";
        data.code = game.code;
        socket.join(roomName(game.code));
        ack({ success: true });
        io.to(roomName(game.code)).emit("game:state", game.getPublicState());
      }
    );

    function requireHostGame(code: string): { game?: ReturnType<GameManager["getGame"]>; error?: string } {
      const game = manager.getGame(code);
      if (!game) return { error: "Game not found." };
      if (game.hostSocketId !== socket.id) return { error: "Not authorized as host." };
      return { game };
    }

    socket.on("host:startGame", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const { game, error } = requireHostGame(payload.code);
      if (!game) return ack({ success: false, error });
      ack(game.startGame());
    });

    socket.on("host:revealClue", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const { game, error } = requireHostGame(payload.code);
      if (!game) return ack({ success: false, error });
      ack(game.revealNextClue());
    });

    socket.on("host:pauseTimer", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const { game, error } = requireHostGame(payload.code);
      if (!game) return ack({ success: false, error });
      ack(game.pauseTimer());
    });

    socket.on("host:resumeTimer", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const { game, error } = requireHostGame(payload.code);
      if (!game) return ack({ success: false, error });
      ack(game.resumeTimer());
    });

    socket.on("host:revealAnswer", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const { game, error } = requireHostGame(payload.code);
      if (!game) return ack({ success: false, error });
      ack(game.revealAnswer());
    });

    socket.on("host:nextQuestion", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const { game, error } = requireHostGame(payload.code);
      if (!game) return ack({ success: false, error });
      ack(game.nextQuestion());
    });

    socket.on("host:endGame", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const { game, error } = requireHostGame(payload.code);
      if (!game) return ack({ success: false, error });
      game.endGame();
      ack({ success: true });
    });

    socket.on(
      "host:removeTeam",
      (payload: { code: string; teamId: string }, ack: (res: { success: boolean; error?: string }) => void) => {
        const { game, error } = requireHostGame(payload.code);
        if (!game) return ack({ success: false, error });
        const removed = game.removeTeam(payload.teamId);
        ack(removed ? { success: true } : { success: false, error: "Could not remove team." });
      }
    );

    // ── Player ─────────────────────────────────────────────────────

    socket.on(
      "player:join",
      (payload: { code: string; teamName: string }, ack: (res: JoinGameAck) => void) => {
        const game = manager.getGame(payload.code);
        if (!game) return ack({ success: false, error: "Game not found." });
        const { team, error } = game.addTeam(payload.teamName);
        if (!team) return ack({ success: false, error });
        data.role = "player";
        data.code = game.code;
        data.teamId = team.id;
        socket.join(roomName(game.code));
        ack({ success: true, teamId: team.id, teamName: team.name, code: game.code });
      }
    );

    socket.on(
      "player:rejoin",
      (payload: { code: string; teamId: string }, ack: (res: PlayerRejoinAck) => void) => {
        const game = manager.getGame(payload.code);
        if (!game) return ack({ success: false, error: "Game not found." });
        const team = game.teams.get(payload.teamId);
        if (!team) return ack({ success: false, error: "Team not found." });
        data.role = "player";
        data.code = game.code;
        data.teamId = team.id;
        socket.join(roomName(game.code));
        game.setTeamConnected(team.id, true);
        ack({ success: true });
      }
    );

    socket.on(
      "player:submitAnswer",
      (payload: { code: string; text: string }, ack: (res: SubmitAnswerAck) => void) => {
        const game = manager.getGame(payload.code);
        if (!game) return ack({ success: false, error: "Game not found." });
        const teamId = data.teamId;
        if (!teamId) return ack({ success: false, error: "You're not part of this game." });
        ack(game.submitAnswer(teamId, payload.text));
      }
    );

    // ── Projector ──────────────────────────────────────────────────

    socket.on("projector:join", (payload: { code: string }, ack: (res: { success: boolean; error?: string }) => void) => {
      const game = manager.getGame(payload.code);
      if (!game) return ack({ success: false, error: "Game not found." });
      data.role = "projector";
      data.code = game.code;
      socket.join(roomName(game.code));
      ack({ success: true });
      socket.emit("game:state", game.getPublicState());
    });

    // ── Disconnect ─────────────────────────────────────────────────

    socket.on("disconnect", () => {
      if (!data.code) return;
      const game = manager.getGame(data.code);
      if (!game) return;
      if (data.role === "host" && game.hostSocketId === socket.id) {
        game.hostSocketId = null;
      } else if (data.role === "player" && data.teamId) {
        game.setTeamConnected(data.teamId, false);
      }
    });
  });
}