const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const { createAdapter } = require("@socket.io/redis-adapter");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pubClient = new Redis({ host: "redis", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

app.use(express.static(__dirname + "/public"));

app.get("/:user", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

io.on("connection", (socket) => {
  console.log("[WS] NEW USER CONNECTED");

  const now = Date.now();

  pubClient.lrange("mensagens", -100, -1).then((msgs) => {
    msgs.forEach((item) => {
      try {
        const msgObj = JSON.parse(item);
        if (now - msgObj.timestamp <= 60000) {
          socket.emit("chat message", msgObj.text);
        }
      } catch (err) {
        console.error("[WS] INVALID MESSAGE FORMAT:", err);
      }
    });
  });

  socket.on("chat message", (msg) => {
    console.log("[WS] MESSAGE RECEIVED:", msg);
    const messageData = { text: msg, timestamp: Date.now() };
    pubClient.rpush("mensagens", JSON.stringify(messageData));
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("[WS] USER DISCONNECTED");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[SERVER] RUNNING ON PORT ${PORT}`);
});