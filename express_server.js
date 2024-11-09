const express = require('express');

const app =  express();
const PORT = 8080;

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