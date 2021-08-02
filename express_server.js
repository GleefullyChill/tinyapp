const express = require('express');
const morgan = require('morgan');

const morganDev = morgan('dev');
const app = express();

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

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}!`);
});