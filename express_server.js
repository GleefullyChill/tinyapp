const express = require('express');
const morgan = require('morgan');

const morganDev = morgan('dev');
const app = express();
app.set('view engine', 'ejs');

const PORT = 4321;

const urlDatabse = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(morganDev);


app.get("/", (req, res) => {
  res.send("This is your only page!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabse);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}!`);
});