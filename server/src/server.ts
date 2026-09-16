import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket.js";

const PORT = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: "*" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Optional single-port production mode: if the client has been built
// (client/dist), serve it as static files from this same server so the
// whole game runs off one URL/port on the host machine.
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/socket.io") || req.path === "/health") return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`The Connection server listening on port ${PORT}`);
});
