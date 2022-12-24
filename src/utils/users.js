const users = []

const addUser = ({ id, username, room }) => {
  //* Clean the data
  username = username.replace(/\s/g, "").toLowerCase()
  room = room.replace(/\s/g, "").toLowerCase()

  //* Validate the data
  if (!username || !room) {
    return {
      error: "username and room are required",
    }
  }

  //* Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })
  //* Validate username
  if (existingUser) {
    return {
      error: "Username is in use already",
    }
  }
  //* Store user
  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id
  })

  if (index !== -1) {
    //* solice returns array and access to first element
    return users.splice(index, 1)[0]
  }
}

const getUsers = (id) => {
  //* we can use filter and access to first element
  return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room)
}

module.exports = { addUser, removeUser, getUsers, getUsersInRoom }
