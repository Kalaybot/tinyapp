const getUserByEmail = (email, database) => {
  for (const newUserID in database) {
    if (database[newUserID].email === email) {
      return database[newUserID];
    }
  }
  return undefined;
};

function generateRandomString() { // Function to create the id or shortURL
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomCharacters = Math.floor(Math.random() * characters.length);
    result += characters[randomCharacters];
  }
  return result;
}

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID",
    totalVisits: 0,
    uniqueVisitors: 0,
    visitHistory: []
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "userRandomID",
    totalVisits: 0,
    uniqueVisitors: 0,
    visitHistory: []
  },
};

const urlsForUser = (userID, urlDatabase) => {
  const userUrls = {};

  for (let id in urlDatabase) {
    if (urlDatabase[id].userId === userID) {
      userUrls[id] = urlDatabase[id];
    }
  }
  return userUrls;
};


module.exports = { getUserByEmail, generateRandomString, urlDatabase, urlsForUser };