import User from "../Database/Models/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const saltRounds = 5;

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, picture } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hash = bcrypt.hashSync(password, saltRounds);
  const newUser = await User.create({
    name,
    email,
    password: hash,
    picture,
  });

  if (newUser) {
    const token = jwt.sign({ _id: newUser._id }, "mySecret", {
      expiresIn: "30d",
    });
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      picture: newUser.picture,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user");
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404);
    throw new Error("No matching user found");
  } else {
    const matched = bcrypt.compareSync(password, user.password);
    if (matched) {
      const token = jwt.sign({ _id: user._id }, "mySecret", {
        expiresIn: "30d",
      });
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        token,
      });
    } else {
      res.status(404);
      throw new Error("No matching user found");
    }
  }
});

export const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});
