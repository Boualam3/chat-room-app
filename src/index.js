const http = require("http")
const path = require("path")
const express = require("express")
const socketio = require("socket.io")

const FILTER = require("bad-words")
const { generateMessages, generateUrls } = require("./utils/messages")
const {
  addUser,
  removeUser,
  getUsers,
  getUsersInRoom,
} = require("../src/utils/users")
const { emit } = require("process")

const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
// app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "../public")))

io.on("connection", (socket) => {
  console.log("New WebSocket connection")

  socket.on("join", (options, callback) => {
    //* options is object with properties { username, room }
    const { error, user } = addUser({ id: socket.id, ...options })
    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit(
      "message",
      generateMessages("Admin", `Welcome to ${user.room} chat room`)
    )

    socket.broadcast
      .to(user.room)
      .emit("newUserJoined", generateMessages(user.username, `has joined`))

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    })
    callback()
  })

  socket.on("message", (message, callback) => {
    const user = getUsers(socket.id)
    const filter = new FILTER()

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!")
    }
    if (!user) return callback("User is not allowed!")

    io.to(user.room).emit("message", generateMessages(user.username, message))
    callback()
  })

  socket.on("sendLocation", (coords, callback) => {
    const user = getUsers(socket.id)
    const { latitude, longitude } = coords
    io.to(user.room).emit(
      "sendLocation",
      generateUrls(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    )
    callback()
  })

  // socket.on("sendGeolocation", (coords, callback) => {
  //   const { latitude, longitude } = coords
  //   io.to(user.room).emit(
  //     "sendLocation",
  //     generateUrls(`https://google.com/maps?q=${latitude},${longitude}`)
  //   )
  //   callback()
  // })

  socket.on("disconnect", () => {
    const user = removeUser(socket.id)

    if (user) {
      io.emit("userDisconnected", generateMessages(user.username, `has left!`))
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      })
    }
  })
})

server.listen(port, console.log("server running on port " + port))
