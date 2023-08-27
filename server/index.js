const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const MongoClient = require('mongodb').MongoClient
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const morgan = require('morgan');
const app = express();
const socket = require("socket.io");
require("dotenv").config();


app.use(morgan('dev'));
app.use(cors());
app.use(express.json());



// console.log(process.env)
const uri = "mongodb://0.0.0.0:27017/test";
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err);
  });
  
  // const uri = "mongodb://0.0.0.0:27017/test";
  // const client = new MongoClient(uri);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

app.listen((8080),()=>{
  console.log("Connected")
})