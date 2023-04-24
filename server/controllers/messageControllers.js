import asyncHandler from "express-async-handler";
import Message from "../Database/Models/messageModel.js";
import User from "../Database/Models/userModel.js";
import Chat from "../Database/Models/chatModel.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return res.status(400);
  }
  var newMessage = {
    sender: req.user,
    content,
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name picture");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name picture email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
export const allMessages = asyncHandler(async (req, res) => {
  try {
    const allMessages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name picture email")
      .populate("chat");
    res.json(allMessages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
