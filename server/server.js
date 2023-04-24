import express from "express";
import dotenv from "dotenv";
import chats from "./Database/dummy.js";
import connectDB from "./config/db.js";
import colors from "colors";
import userApi from "./routes/userRoutes.js";
import chatApi from "./routes/chatRoutes.js";
import authApi from "./routes/authRoute.js";
import messageApi from "./routes/messageRoute.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import passport from "passport";
import passportConfig from "./config/passport.js";
import { Server, Socket } from "socket.io";

const app = express();
dotenv.config();

await connectDB();

app.use(express.json());
passportConfig(passport);

app.use("/api/user", userApi);
app.use("/api/chat", chatApi);
app.use("/api/auth", authApi);
app.use("/api/message", messageApi);

app.use(notFound);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API is running succesfully.");
});

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
  const singleChat = chats.find((c) => c._id == req.params.id);
  res.send(singleChat);
});

//Socket.io for realtime chatting

const myServer = app.listen(process.env.PORT, () => {
  console.log("Server started at port 4000".yellow.bold);
});

const io = new Server(myServer, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  //Initializing a room for logged in user
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  //Joining the room of selectedChat
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  //typing message
  socket.on("typing", (chatAndUserid) => {
    chatAndUserid.chat.users.forEach((user) => {
      if (user._id === chatAndUserid.userId) return;
      socket.in(chatAndUserid.chat._id).emit("typing");
    });
  });

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  //Sending messages realtime for everyone in same room
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined!");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});
