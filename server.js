const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const votes = {
  connectedCount: 0,
  votes: [],
  voted: {}
};

// socket.io server
io.on("connection", socket => {
  votes.connectedCount = socket.client.conn.server.clientsCount;
  socket.emit("votes.userCount", votes.connectedCount);
  socket.broadcast.emit("votes.userCount", votes.connectedCount);

  socket.on("votes.vote", data => {
    if (votes.voted[data.id] !== true) {
      votes.voted[data.id] = true;
      votes.votes.push(data.value);
      console.log("votes", votes);
    }
    socket.emit("votes.vote", votes.votes);
    socket.broadcast.emit("votes.vote", votes.votes);
  });

  socket.on("votes.reset", () => {
    votes.voted = {};
    votes.votes = [];
    socket.emit("votes.vote", votes.votes);
    socket.broadcast.emit("votes.vote", votes.votes);
  });

  socket.on("disconnect", () => {
    votes.connectedCount = socket.client.conn.server.clientsCount;
    socket.broadcast.emit("votes.userCount", votes.connectedCount);
  });
});

nextApp.prepare().then(() => {
  app.get("/votes", (req, res) => {
    res.json(votes);
  });

  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
