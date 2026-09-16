import { useCallback, useEffect, useState } from "react";
import { socket } from "../lib/socket";
import type { PublicGameState, SimpleAck } from "../types";

const STORAGE_KEY = "the-connection:projector";

export function useProjector() {
  const [state, setState] = useState<PublicGameState | null>(null);
  const [code, setCode] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback((rawCode: string) => {
    const cleanCode = rawCode.trim().toUpperCase();
    setError(null);
    socket.emit("projector:join", { code: cleanCode }, (res: SimpleAck) => {
      if (res.success) {
        setCode(cleanCode);
        sessionStorage.setItem(STORAGE_KEY, cleanCode);
      } else {
        setError(res.error ?? "Could not connect to that game.");
      }
    });
  }, []);

  useEffect(() => {
    const onState = (s: PublicGameState) => setState(s);
    const onConnect = () => {
      if (code) connect(code);
    };
    socket.on("game:state", onState);
    socket.on("connect", onConnect);
    if (socket.connected && code) connect(code);

    return () => {
      socket.off("game:state", onState);
      socket.off("connect", onConnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, code, error, connect };
}
