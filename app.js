//jshint esversion:6
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import md5 from "md5";
import bcrypt from "bcrypt";
// import encrypt from "mongoose-encryption";

dotenv.config();

import ejs from "ejs";

const app = express();
const port = 3000;
const saltRounds = 5;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/userDB").then(() => {
  console.log("Connected to database");
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// const secret = process.env.SECRET;

// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    await newUser.save().then(() => {
      res.render("secrets");
    });
  });
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  const registeredUser = await User.findOne({ email: email });
  bcrypt.compare(password, registeredUser.password, function (err, result) {
    if (result) {
      res.render("secrets");
    } else {
      res.redirect("register");
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
