const express = require('express');
const morgan = require('morgan');
const morganDev = morgan('dev');

const PORT = 4321;

const app = express();

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const generateRandomString = function() {
  let str = "";
  for (let i = 0; i < 6; i++) {
    let char = Math.random() * 61;
    char = Math.floor(char);
    if (char < 10) {
      str += char;
    } else if (char > 35) {
      char = String.fromCharCode(char + 29);
      str += char;
    } else {
      char = String.fromCharCode(char + 87);
      str += char;
    }
  }
  return str;
};

const urlDatabse = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(morganDev);

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabse };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//after creating a new shortURL it redirects to the shorURL's respective /url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabse[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//redirects the shortURL from its respective /url to the corresponding web addreess
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabse[req.params.shortURL];
  if (longURL === undefined) {
    res.redirect('/urls');
  } else {
    res.redirect(longURL);
  }
});

//should delete the respective shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabse[req.params['shortURL']];
  res.redirect(`/urls`);
});

app.get("/", (req, res) => {
  res.send("This is your HOME page!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabse);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabse[req.params.shortURL]};//longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}!`);
});