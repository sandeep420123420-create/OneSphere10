const express = require("express");

const http = require("http");

const { Server } = require("socket.io");

const path = require("path");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const USERS = {
  anshika: "1111",
  nishant: "2222",
  vipul: "3333",
  rohit: "4444",
  neha: "5555",
  aman: "6666"
};

const onlineUsers = new Map();

const roomMessages = [];

io.on("connection", socket => {

  console.log("User Connected");

  socket.on("login", data => {

    const { username, password } = data;

    if(!USERS[username]){

      socket.emit(
        "login_error",
        "Invalid Username"
      );

      return;
    }

    if(USERS[username] !== password){

      socket.emit(
        "login_error",
        "Wrong Password"
      );

      return;
    }

    onlineUsers.set(socket.id, username);

    socket.username = username;

    socket.join("global");

    socket.emit("login_success", {
      username
    });

    io.emit(
      "users",
      Array.from(onlineUsers.values())
    );

    socket.broadcast.emit(
      "system",
      `${username} joined chat`
    );

    // NEW USER CANNOT SEE OLD MESSAGES
    // No old messages sent here
  });

  socket.on("typing", user => {

    socket.broadcast.emit("typing", user);
  });

  socket.on("message", encryptedMsg => {

    if(!socket.username) return;

    const msgData = {
      user: socket.username,
      text: encryptedMsg
    };

    roomMessages.push(msgData);

    io.to("global").emit(
      "message",
      msgData
    );
  });

  socket.on("disconnect", () => {

    if(socket.username){

      onlineUsers.delete(socket.id);

      io.emit(
        "users",
        Array.from(onlineUsers.values())
      );

      socket.broadcast.emit(
        "system",
        `${socket.username} left chat`
      );
    }
  });
});

server.listen(3000, () => {

  console.log(
    "Server Running on Port 3000"
  );
});
