import { io, Socket } from "socket.io-client";

// Figure out where the server lives without hardcoding an IP.
// - If VITE_SERVER_URL is set (e.g. for a production single-host build),
//   use it directly.
// - Otherwise, assume the server runs on the same machine/host that served
//   this page, on VITE_SERVER_PORT (default 3001). This is what lets a
//   phone that opened http://192.168.1.23:5173/join also reach the server
//   at http://192.168.1.23:3001 with zero configuration.
function resolveServerUrl(): string {
  const envUrl = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (envUrl) return envUrl;

  const port = (import.meta.env.VITE_SERVER_PORT as string | undefined) || "3001";
  const { protocol, hostname } = window.location;

  // Single-port production mode: the client is served BY the same Express
  // server, so sockets should just connect to the current origin.
  const currentPort = window.location.port;
  if (currentPort === port) {
    return `${protocol}//${window.location.host}`;
  }

  return `${protocol}//${hostname}:${port}`;
}

export const socket: Socket = io(resolveServerUrl(), {
  autoConnect: true,
  reconnection: true,
});
