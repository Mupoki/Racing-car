import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  const server = new Server(app);
  const wss = new WebSocketServer({ server });

  // Game State
  const players: Record<string, any> = {};

  wss.on("connection", (ws: WebSocket) => {
    const id = Math.random().toString(36).substring(2, 9);
    console.log(`Player connected: ${id}`);

    // Initial state
    players[id] = {
      id,
      x: 400,
      y: 300,
      rotation: 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      name: `Player ${id.substring(0, 3)}`,
    };

    // Send initial state and current players
    ws.send(JSON.stringify({ type: "init", id, players }));

    // Broadcast new player
    broadcast({ type: "player_joined", player: players[id] }, id);

    ws.on("message", (data: string) => {
      try {
        const message = JSON.parse(data);
        if (message.type === "update") {
          if (players[id]) {
            players[id] = { ...players[id], ...message.data };
            broadcast({ type: "player_updated", id, data: message.data }, id);
          }
        }
      } catch (e) {
        console.error("Error parsing message", e);
      }
    });

    ws.on("close", () => {
      console.log(`Player disconnected: ${id}`);
      delete players[id];
      broadcast({ type: "player_left", id });
    });

    function broadcast(message: any, excludeId?: string) {
      const payload = JSON.stringify(message);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          // We could exclude the sender, but for simplicity we often broadcast to all
          // and let the client handle reconciliation.
          client.send(payload);
        }
      });
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
