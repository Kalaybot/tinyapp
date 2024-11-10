const express = require('express');

const app =  express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true })); // Translate 'Buffer' data type into a string we can read

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!"); // Welcome Page of the server
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); // lets client know that server is listnening on PORT
});

app.get("/urls.json", (req, res) => { // Route setup for /urls.json
  res.json(urlDatabase); // http://localhost:8080/urls.json response as a JSON string of the entire urlDatabase
});

app.get("/hello", (req, res) => { // Route setup for /hello
  res.send("<html><body>Hello <b>World</b></body></html>\n"); // When visiting http://localhost:8080/hello it would show "Hello World"
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // Route setup for /urls
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new"); // Use urls_new Template for this route
});

app.post("/urls", (req, res) => {
  console.log("shortURL:", generateRandomString()) // generates random 6 characters (temporary)
  console.log(req.body); // returns longURL as a JS object
  res.send("ok"); // Server response "Ok" (temporary)
  })
  
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase };
  res.render("urls_show", templateVars);
  });
    
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8); // Temporary shortURL generator
};
