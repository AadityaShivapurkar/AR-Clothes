// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.post("/login", (request, response) => {
  // What should server do when client submits the login form:
  // check if login_email from request exists in Auth table
  db.get(
    "SELECT * FROM Auth WHERE email = ?",
    request.body.login_email,
    (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      // if not, return "DOESN'T EXIST"
      if (!row) {
        response.send({ status_id: 1, auth_status: "Account doesn't exist!" });
        return console.error("Account doesn't exist");
      }
      // compare login_pass with corresponding email in table
      if (row.pass != request.body.pass) {
        // if they don't match: return "INCORRECT"
        response.send({ status_id: 2, auth_status: "Incorrect pass!" });
        return console.error("Incorrect pass");
      }
      // log/alert: "Welcome back," + username
      response.send({ status_id: 3, auth_status: "Welcome back, " + row.user, name: row.user });
      return console.log("Welcome back, " + row.user);
    }
  );
});

app.post("/register", (request, response) => {
  console.log(JSON.stringify(request.body));
  // what should server do when client submits regtration form
  // check if login_email already exists in Auth table
  db.serialize(() => {
    db.get(
      "SELECT * FROM Auth WHERE email = ?",
      request.body.email,
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        // if yes, respond "ALREADY EXISTS!"
        if (row) {
          response.send({
            status_id: 1,
            auth_status: "Account already exists!"
          });
          return console.error("Account already exists");
        }
        // otherwise, simply add new user to Auth table
        db.run(
          "INSERT INTO Auth VALUES (?, ?, ?, ?)",
          request.body.email,
          request.body.uname,
          request.body.pass,
          request.body.ph_no,
          error => {
            if (error) {
              console.log(error);
              response.send({
                status_id: 0,
                auth_status: "Registration failed"
              });
            } else {
              response.send({
                status_id: 2,
                auth_status: "New user registered successfully"
              });
            }
          }
        );
      }
    );
  });
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});


