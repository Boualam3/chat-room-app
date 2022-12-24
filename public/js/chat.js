const form = document.querySelector(".message-box")
const inputMsg = document.querySelector(".message-input")
const chatContainer = document.querySelector(".chat-container")
const sendLocationBtn = document.getElementById("send-location")
const sideBar = document.querySelector(".side-bar")
const updateScroll = () => {
  var chatContainer = document.querySelector(".chat-container")
  chatContainer.scrollTop = chatContainer.scrollHeight
}
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&")
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ""
  return decodeURIComponent(results[2].replace(/\+/g, " "))
}
const username = getParameterByName("username")
const room = getParameterByName("room")
console.log(username, room)
const socket = io()
socket.on("message", (messageObj) => {
  console.log(messageObj)
  if (messageObj) {
    chatContainer.innerHTML += `<div class="container-messages">
    <i class="fa-sharp fa-solid fa-user user-icon"></i>
    <p class='user-name'>${messageObj.username}</p>
    <p class="message">${messageObj.message}</p>
    <span class='time'>${moment(messageObj.createdAt).format("h:mm a")}<span>
    </div>`
    updateScroll()
  }
})

socket.on("userDisconnected", (infoUserObj) => {
  if (infoUserObj) {
    chatContainer.innerHTML += `<p class="user-disconnected">${
      infoUserObj.username + " " + infoUserObj.message
    }</p>`
    updateScroll()
  }
})

socket.on("newUserJoined", (infoUserObj) => {
  if (infoUserObj) {
    chatContainer.innerHTML += `<div class="user-joined-container">
    <span class="right-line"></span>
    <p class="new-user-joined">${
      infoUserObj.username + " " + infoUserObj.message
    }</p>
    <span class="left-line"></span>
    </div>`
    updateScroll()
  }
})

socket.on("sendLocation", (locationObj) => {
  const pattern =
    /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/i
  if (locationObj.url.match(pattern)) {
    chatContainer.innerHTML += `<div class="container-messages">
    <i class="fa-sharp fa-solid fa-user user-icon"></i>

    <p class='user-name'>${locationObj.username}</p>
    <p class="message"><a class="user-location" target="_blank" href=${
      locationObj.url
    }}>My current location</a></p>
    <span class='time'>${moment(locationObj.createdAt).format("h:mm a")}<span>
    </div>`
    updateScroll()
  }
})

socket.on("roomData", ({ room, users }) => {
  const usersList = convertArrayUsersToStrings(users)
  document.querySelector("#online-users").innerHTML = usersList
  document.querySelector("#current-room").innerHTML = room

  console.log(usersList)
})

const sendMsg = (e) => {
  e.preventDefault()

  const msg = inputMsg.value
  if (msg) {
    socket.emit("message", msg, (error) => {
      if (error) {
        return alert(error)
      }

      console.log("The message was delivered")
    })
    inputMsg.value = ""
    // messageElm.textContent = ""
  }
  inputMsg.focus()
}

form.addEventListener("submit", (event) => {
  sendMsg(event)
})

inputMsg.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    sendMsg(event)
  }
})

sendLocationBtn.addEventListener("click", (event) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser")
  }

  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position)
    const {
      coords: { latitude, longitude },
    } = position

    socket.emit("sendLocation", { latitude, longitude }, () => {
      sendLocationBtn.disabled = true
      console.log("Location shared!")
    })
  })
})

//? try to send error message to user on ui . like username exist
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = "/"
  }
})

const convertArrayUsersToStrings = (users) => {
  console.log(users)
  if (!users) return "<p class='user-info'>No user in room</p>"

  return users
    .map((user) => "<p class='user-info'>" + user.username + "</p>")
    .join(" ")
}

//* Make chatroom app responsive
const contentContainer = document.querySelector(".content-container")
const mainContainer = document.querySelector(".container ")
const header = document.querySelector(".header")
const btnShowSidebar = document.querySelector(".show-sidebar ")
var width = 0
function updateWindowSize() {
  if (document.body && document.body.offsetWidth) {
    width = document.body.offsetWidth
  }
  if (
    document.compatMode == "CSS1Compat" &&
    document.documentElement &&
    document.documentElement.offsetWidth
  ) {
    width = document.documentElement.offsetWidth
  }
  if (window.innerWidth) {
    width = window.innerWidth
  }
}

window.onresize = function (event) {
  updateWindowSize()
  if (width < 550) {
    mainContainer.classList.add("mobile-view")
    contentContainer.classList.add("mobile-view")
    header.classList.add("mobile-view")
    chatContainer.classList.add("mobile-view")
    form.classList.add("mobile-view")
    btnShowSidebar.classList.add("mobile-view")
    updateWindowSize()
  } else if (width < 790) {
    mainContainer.classList.remove("mobile-view")
    contentContainer.classList.remove("mobile-view")
    header.classList.remove("mobile-view")
    chatContainer.classList.remove("mobile-view")
    form.classList.remove("mobile-view")
    sideBar.classList.remove("mobile-view")
    btnShowSidebar.classList.remove("mobile-view")
    btnShowSidebar.classList.add("mobile-view")
    mainContainer.classList.add("tablet-view")
    sideBar.classList.add("tablet-view")
    contentContainer.classList.add("tablet-view")
    chatContainer.classList.add("tablet-view")
    updateWindowSize()
  } else if (width > 800) {
    btnShowSidebar.classList.remove("mobile-view")
    mainContainer.classList.remove("tablet-view")
    sideBar.classList.remove("tablet-view")
    contentContainer.classList.remove("tablet-view")
    chatContainer.classList.remove("tablet-view")
  }

  btnShowSidebar.classList.remove("mobile-view")
  mainContainer.classList.remove("tablet-view")
  sideBar.classList.remove("tablet-view")
  contentContainer.classList.remove("tablet-view")
  chatContainer.classList.remove("tablet-view")
}

document.querySelector(".show-sidebar").addEventListener("click", () => {
  updateWindowSize()
  if (width < 550) {
    sideBar.classList.toggle("mobile-view")
  }
  updateWindowSize()
  if (width > 550 && width < 790) {
    sideBar.classList.toggle("tablet-view")
  }
})
