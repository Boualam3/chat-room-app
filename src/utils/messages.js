const generateMessages = (user, text) => {
  return {
    username: user,
    message: text,
    createdAt: new Date().getTime(),
  }
}

const generateUrls = (username, url) => {
  return {
    username: username,
    url: url,
    createdAt: new Date().getTime(),
  }
}

module.exports = {
  generateMessages,
  generateUrls,
}
