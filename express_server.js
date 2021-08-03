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
    if (char < 10) {
      char = Math.floor(char);
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
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabse[shortURL] = req.body.longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  const longURL = urlDatabse[req.params.shortURL];
  res.redirect(longURL);
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