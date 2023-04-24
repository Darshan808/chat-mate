import asyncHandler from "express-async-handler";
import Chat from "../Database/Models/chatModel.js";
import User from "../Database/Models/userModel.js";
import chats from "../Database/dummy.js";

//creating or fetching 1 on 1 chat
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
    // $and: [
    //   { users: { $elemMatch: { $eq: req.user._id } } },
    //   { users: { $elemMatch: { $eq: userId } } },
    // ],
  })
    .populate("users", "-password") //in users array bring all info from given _id except password
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      console.log("new chat created");
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//Fetching all chats of a single user

export const fetchChat = asyncHandler(async (req, res) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//Creating a groupChat

export const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the Feilds" });
  }
  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: "More than 2 users are required to form a group chat" });
  }
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//Renaming a group chat

export const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName) {
    return res.status(400).send({ message: "Please Fill all the Feilds" });
  }
  try {
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(updatedGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//Adding user into groupchat

export const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(400).send({ message: "Please Fill all the Feilds" });
  }
  try {
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.send(updatedGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//Removing user from groupchat

export const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(400).send({ message: "Please Fill all the Feilds" });
  }
  try {
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.send(updatedGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
