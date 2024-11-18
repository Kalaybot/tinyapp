const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app =  express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true })); // Translate 'Buffer' data type into a string we can read
app.use(cookieParser()); // Client cookie is parsed

app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!"); // Welcome Page of the server
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); // lets client know that server is listnening on PORT
});

app.get("/urls.json", (req, res) => { // Route setup for /urls.json
  res.json(urlDatabase); // Server response a JSON string of entire database
});

app.get("/hello", (req, res) => { // Route setup for /hello
  res.send("<html><body>Hello <b>World</b></body></html>\n"); // server route says "Hello World"
});

app.get("/urls", (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 Forbidden</h2><p>Log in or Register first.</p>");
  }

  const userUrls = urlsForUser(newUserID);

  const templateVars = {
    user,
    urls: userUrls,
    urlDatabase,
  }; // Route setup for saved urls
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 No Access</h2><p>User must log in.</p>");
  }

  console.log(req.body); // returns longURL as a JS object

  const longURL = req.body.longURL; // Extract longURL to the body
  const id = generateRandomString(); // Generates the new id

  urlDatabase[id] = {
    longURL: longURL,
    userID: newUserID
  };

  res.redirect("/urls"); // Redirect to urls/:id. id has value now
});

app.get("/urls/new", (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {
    user, // Displays user in this route
  };

  res.render("urls_new", templateVars); // Direct to a route with a form to complete
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(404).send("<h2>404 ERROR</h2><p>This shortened URL does not exist.</p>");
  }

  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);
});
  
app.get("/urls/:id", (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 No Access</h2><p>Log in to view this URL.</p>");
  }

  const id = req.params.id;
  const url = urlDatabase[id]; // Fetch long URL

  if (!url) {
    return res.status(404).send("<h2>404 ERROR</h2><p>This shortened URL does not exist.</p>");
  }

  if (url.userID !== newUserID) {
    return res.status(403).send("<h2>403 No Access</h2><p>No permission to access this URL</p>");
  }

  const templateVars = {
    user,
    id,
    longURL: url.longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 Forbidden</h2><p>No access, must log in.</p>");
  }

  const id = req.params.id;
  const updatedURL = req.body.updatedURL; //Fetch updated URL from form

  if (!urlDatabase[id]) {
    return res.status(404).send("<h2>404 Not Found</h2><p>URL not found.</p>");
  }

  if (urlDatabase[id].userID !== newUserID) {
    return res.status(403).send("<h2>403 Forbidden</h2><p>You do not own this URL.</p>");
  }

  urlDatabase[id].longURL = updatedURL;
  res.redirect("/urls");
});

app.post(`/urls/:id/delete`, (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 Forbidden</h2><p>No access, must log in.</p>");
  }

  const id = req.params.id; // Extracts id of URL
  const url = urlDatabase[id];

  if (!url) {
    return res.status(404).send("<h2>404 Not Found</h2><p>URL not found.</p>");
  }
  
  if (url.userID !== newUserID) {
    return res.status(403).send("<h2>403 No Access</h2><p>No permission to access this URL</p>");
  }

  delete urlDatabase[id];
  
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (user) {
    return res.redirect("/urls");
  }

  res.render("login", { user });
});

app.post("/login", (req, res) => { // Route for login
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and Password need to be filled.");
  }

  const user = userLooker(email);
  if (!user) {
    return res.status(403).send("Email cannot be found.");
  }

  const hashedPassword = user.password;
  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(403).send("Incorrect password.");
  }

  res.cookie("user_id", user.id); // Save client cookie (email)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Logout route, deletes cookie and let you log out

  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const newUserID = req.cookies["user_id"];
  const user = users[newUserID];

  if (user) {
    return res.redirect("/urls");
  }

  res.render("register", { user }); // Our register template form
});

app.post("/register", (req, res) => { // Creates new user for App by filling up our form
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and Password needs to be filled.");
  }

  const user = userLooker(email);
  if (user) {
    return res.status(400).send("Email already exist.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUserID = generateRandomString();
  
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: hashedPassword,
  };

  res.cookie("user_id", newUserID);
  console.log("New user:", users);

  res.redirect("/urls");
});


function generateRandomString() { // Function to create the id or shortURL
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomCharacters = Math.floor(Math.random() * characters.length);
    result += characters[randomCharacters];
  }
  return result;
}

const userLooker = (email) => {
  for (const newUserID in users) {
    if (users[newUserID].email === email) {
      return users[newUserID];
    }
  }
  return null;
};


const urlsForUser = (userID) => {
  const userUrls = {};

  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      userUrls[id] = urlDatabase[id];
    }
  }
  return userUrls;
};