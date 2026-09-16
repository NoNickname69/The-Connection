import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../lib/socket";
import type { CreateGameAck, PublicGameState, SimpleAck } from "../types";

const STORAGE_KEY = "the-connection:host";

interface StoredHost {
  code: string;
  hostToken: string;
}

function loadStored(): StoredHost | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredHost) : null;
  } catch {
    return null;
  }
}

function saveStored(value: StoredHost | null) {
  if (!value) {
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}

export function useHostGame() {
  const [state, setState] = useState<PublicGameState | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const hostTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const onState = (s: PublicGameState) => setState(s);
    const onConnect = () => {
      setConnected(true);
      // If we already own a game (e.g. reconnect / hot reload), rejoin it.
      const stored = loadStored();
      if (stored) {
        hostTokenRef.current = stored.hostToken;
        setCode(stored.code);
        socket.emit("host:rejoin", stored, (res: SimpleAck) => {
          if (!res.success) {
            saveStored(null);
            setCode(null);
            setError(res.error ?? "Could not reconnect to the game.");
          }
        });
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

  const createGame = useCallback(() => {
    setError(null);
    socket.emit("host:createGame", {}, (res: CreateGameAck) => {
      if (res.success && res.code && res.hostToken) {
        hostTokenRef.current = res.hostToken;
        setCode(res.code);
        saveStored({ code: res.code, hostToken: res.hostToken });
      } else {
        setError(res.error ?? "Could not create game.");
      }
    });
  }, []);

  const withCode = useCallback(
    (event: string) =>
      (extra: Record<string, unknown> = {}, onAck?: (res: SimpleAck) => void) => {
        if (!code) return;
        socket.emit(event, { code, ...extra }, (res: SimpleAck) => {
          if (!res.success) setError(res.error ?? "Something went wrong.");
          onAck?.(res);
        });
      },
    [code]
  );

  return {
    state,
    code,
    connected,
    error,
    createGame,
    startGame: withCode("host:startGame"),
    revealClue: withCode("host:revealClue"),
    pauseTimer: withCode("host:pauseTimer"),
    resumeTimer: withCode("host:resumeTimer"),
    revealAnswer: withCode("host:revealAnswer"),
    nextQuestion: withCode("host:nextQuestion"),
    endGame: (onAck?: (res: SimpleAck) => void) => {
      withCode("host:endGame")({}, onAck);
      saveStored(null);
    },
    removeTeam: (teamId: string) => withCode("host:removeTeam")({ teamId }),
    clearError: () => setError(null),
  };
}
