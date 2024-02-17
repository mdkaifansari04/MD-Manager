const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const Students = require("./models/student");
const Admin = require("./models/admin");
const studentRouter = require("./routes/student");
const adminRouter = require("./routes/admin");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const sessions = require("express-session");
const methodOverride = require("method-override");

const app = express();
const PORT = 8000;
const oneDay = 1000 * 60 * 60 * 24;

mongoose.set("strictQuery", "false");
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((error) => {
    console.log(error);
  });

app.set("view engine", "ejs");

app.use(
  sessions({
    name: `userSession`,
    secret: "some-secret-example",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: oneDay,
    },
  })
);

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(methodOverride("_method"));

app.get("/", async (req, res) => {
  let message = req.flash("message");
  let allStudent = await Students.find({});
  let hidden = "hidden";
  console.log(req.session.email);

  if (req.session.email) {
    res.render("index", {
      message: message,
      Students: allStudent,
      specialOption: "",
      option: "Logout",
    });
  } else {
    res.render("index", {
      message: message,
      Students: allStudent,
      specialOption: hidden,
      option: "Login",
    });
  }
});

app.get("/registration", (req, res) => {
  let message = req.flash("message");
  let alert = req.flash("alert");

  if (req.session.email) {
    res.render("registration", {
      message: message,
      specialOption: "",
      option: "Logout",
      alertMessage: alert,
    });
  } else {
    res.send("Oops something went wrong");
  }
});

app.get("/submission", (req, res) => {
  let message = req.flash("message");
  let alert = req.flash("alert");

  if (req.session.email) {
    res.render("submission", {
      message: message,
      specialOption: "",
      option: "Logout",
      alertMessage: alert,
    });
  } else {
    res.send("Oops something went wrong");
  }
});

app.get("/login", (req, res) => {
  let message = req.flash("message");
  let alert = req.flash("alert");

  if (req.session.email) {
    res.render("login", {
      message: message,
      specialOption: "",
      option: "Logout",
      alertMessage: alert,
    });
  } else {
    res.render("login", {
      message: message,
      specialOption: "hidden",
      option: "Login",
      alertMessage: alert,
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.post("/subscribe", (req, res) => {
  req.flash("message", "Subscribed MD Manager, will get the updates");
  res.redirect("/");
});

app.use("/student", studentRouter);
app.use("/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
