const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const{ getUserByEmail, generateRandomString, urlDatabase, urlsForUser }= require('./helpers')

const app =  express();
const PORT = 8080;

// Middleware to parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({ // Middleware for managing sessions using cookies
  name: 'session',
  keys: ['k3ys4cookies'], // Secret key for signing cookies
  maxAge: 24 * 60 * 60 * 1000 // Session expiry time (24 hours)
}));

app.set("view engine", "ejs"); // Set EJS as the template engine for views

// Users database - storing users and their hashed passwords
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
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

app.get("/hello", (req, res) => { // Route for a simple hello page
  res.send("<html><body>Hello <b>World</b></body></html>\n"); // server route says "Hello World"
});

// Route to display all the URLs belonging to the logged-in user
app.get("/urls", (req, res) => {
  const newUserID = req.session.user_id;
  const user = users[newUserID];

  if (!user) { // If the user is not logged in, show a 403 Forbidden error
    return res.status(403).send("<h2>403 Forbidden</h2><p>Log in or Register first.</p>");
  }

  // Fetch URLs belonging to the logged-in user using a helper function
  const userUrls = urlsForUser(newUserID, urlDatabase);

  // Pass user info and URLs to the template for rendering
  const templateVars = {
    user,
    urls: userUrls,
    urlDatabase,
  }; // Route setup for saved urls
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newUserID = req.session.user_id;
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 No Access</h2><p>User must log in.</p>");
  }

  console.log(req.body); // returns longURL as a JS object

  const longURL = req.body.longURL; // Extract longURL to the body
  const id = generateRandomString(); // Generates the new id

  urlDatabase[id] = {  // Add the new URL to the urlDatabase
    longURL: longURL,
    userId: newUserID
  };

  res.redirect("/urls"); // Redirect to urls/:id. id has value now
});

app.get("/urls/new", (req, res) => { // Route to render the form for creating a new shortened URL
  const newUserID = req.session.user_id;
  const user = users[newUserID];

  if (!user) { // If the user is not logged in, redirect to login page
    return res.redirect("/login");
  }

  const templateVars = {
    user, // Displays user in this route
  };

  res.render("urls_new", templateVars); // Direct to a route with a form to complete
});

app.get("/u/:id", (req, res) => { // Route to redirect from a short URL ID to its corresponding long URL
  const id = req.params.id;

  if (!urlDatabase[id]) { // If the URL ID doesn't exist, return a 404 error
    return res.status(404).send("<h2>404 ERROR</h2><p>This shortened URL does not exist.</p>");
  }

  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);
});
  
app.get("/urls/:id", (req, res) => { // Route to display and edit a specific shortened URL
  const newUserID = req.session.user_id;
  const user = users[newUserID];

  if (!user) { // If the user is not logged in, show a 403 error
    return res.status(403).send("<h2>403 No Access</h2><p>Log in to view this URL.</p>");
  }

  const id = req.params.id;
  const url = urlDatabase[id]; // Fetch long URL

  if (!url) { // If the URL doesn't exist, return a 404 error
    return res.status(404).send("<h2>404 ERROR</h2><p>This shortened URL does not exist.</p>");
  }

  if (url.userId !== newUserID) { // If the logged-in user doesn't own the URL, return a 403 error
    return res.status(403).send("<h2>403 No Access</h2><p>No permission to access this URL</p>");
  }

  const templateVars = {
    user,
    id,
    longURL: url.longURL
  };
  res.render("urls_show", templateVars); // Render the 'urls_show' view
});

app.post("/urls/:id", (req, res) => {
  const newUserID = req.session.user_id;
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 Forbidden</h2><p>No access, must log in.</p>");
  }

  const id = req.params.id;
  const updatedURL = req.body.updatedURL; //Fetch updated URL from form

  if (!urlDatabase[id]) {
    return res.status(404).send("<h2>404 Not Found</h2><p>URL not found.</p>");
  }

  if (urlDatabase[id].userId !== newUserID) {
    return res.status(403).send("<h2>403 Forbidden</h2><p>You do not own this URL.</p>");
  }

  urlDatabase[id].longURL = updatedURL;
  res.redirect("/urls");
});

app.post(`/urls/:id/delete`, (req, res) => {
  const newUserID = req.session.user_id;
  const user = users[newUserID];

  if (!user) {
    return res.status(403).send("<h2>403 Forbidden</h2><p>No access, must log in.</p>");
  }

  const id = req.params.id; // Extracts id of URL
  const url = urlDatabase[id];

  if (!url) {
    return res.status(404).send("<h2>404 Not Found</h2><p>URL not found.</p>");
  }
  
  if (url.userId !== newUserID) {
    return res.status(403).send("<h2>403 No Access</h2><p>No permission to access this URL</p>");
  }

  delete urlDatabase[id];
  
  res.redirect("/urls");
});

app.get("/login", (req, res) => { // Route to render the login form
  const newUserID = req.session.user_id;
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

  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("Email cannot be found.");
  }

  const hashedPassword = user.password;
  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(403).send("Incorrect password.");
  }

  req.session.user_id = user.id;// Save client cookie (email)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null; // Logout route, deletes cookie and let you log out

  res.redirect("/login"); //redirects to login once logout
});

app.get("/register", (req, res) => {
  const newUserID = req.session.user_id;
  const user = users[newUserID];

  if (user) {
    return res.redirect("/urls");
  }

  res.render("register", { user }); // Our register template form
});

app.post("/register", (req, res) => { // Route to handle registration form submission (POST request)
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and Password needs to be filled.");
  }

  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("Email already exist.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password before saving

  const newUserID = generateRandomString(); // Generate a new user ID
  
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = newUserID; // Set session with the new user's ID
  console.log("New user:", users); // Log the new user

  res.redirect("/urls");
});
