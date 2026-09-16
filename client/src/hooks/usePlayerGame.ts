import { useCallback, useEffect, useState } from "react";
import { socket } from "../lib/socket";
import type { JoinGameAck, PublicGameState, SimpleAck } from "../types";

const STORAGE_KEY = "the-connection:player";

interface StoredPlayer {
  code: string;
  teamId: string;
  teamName: string;
}

function loadStored(): StoredPlayer | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPlayer) : null;
  } catch {
    return null;
  }
}

function saveStored(value: StoredPlayer | null) {
  if (!value) sessionStorage.removeItem(STORAGE_KEY);
  else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function usePlayerGame() {
  const [state, setState] = useState<PublicGameState | null>(null);
  const [team, setTeam] = useState<StoredPlayer | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const onState = (s: PublicGameState) => setState(s);
    const onConnect = () => {
      setConnected(true);
      const stored = loadStored();
      if (stored) {
        setTeam(stored);
        socket.emit(
          "player:rejoin",
          { code: stored.code, teamId: stored.teamId },
          (res: SimpleAck) => {
            if (!res.success) {
              saveStored(null);
              setTeam(null);
              setError(res.error ?? "Could not reconnect. Please rejoin.");
            }
          }
        );
      }
    };
    const onDisconnect = () => setConnected(false);

    socket.on("game:state", onState);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off("game:state", onState);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const join = useCallback((code: string, teamName: string) => {
    setError(null);
    setJoining(true);
    const cleanCode = code.trim().toUpperCase();
    socket.emit("player:join", { code: cleanCode, teamName }, (res: JoinGameAck) => {
      setJoining(false);
      if (res.success && res.teamId && res.teamName && res.code) {
        const stored = { code: res.code, teamId: res.teamId, teamName: res.teamName };
        setTeam(stored);
        saveStored(stored);
      } else {
        setError(res.error ?? "Could not join game.");
      }
    });
  }, []);

  const submitAnswer = useCallback(
    (text: string, onAck?: (res: SimpleAck) => void) => {
      if (!team) return;
      socket.emit("player:submitAnswer", { code: team.code, text }, (res: SimpleAck) => {
        if (!res.success) setError(res.error ?? "Could not submit answer.");
        onAck?.(res);
      });
    },
    [team]
  );

  const leave = useCallback(() => {
    saveStored(null);
    setTeam(null);
    setState(null);
  }, []);

  const myTeam = state?.teams.find((t) => t.id === team?.teamId) ?? null;

  return { state, team, myTeam, connected, error, joining, join, submitAnswer, leave, clearError: () => setError(null) };
}
