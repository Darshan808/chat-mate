export const getSender = (loggedUser, chatUsers) => {
  return chatUsers[0]._id === loggedUser._id
    ? chatUsers[1].name
    : chatUsers[0].name;
};
export const getSenderFull = (loggedUser, chatUsers) => {
  return chatUsers[0]._id === loggedUser._id ? chatUsers[1] : chatUsers[0];
};

//Returns true if it is the last chat of one another sender
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    messages[i + 1].sender._id !== m.sender._id &&
    messages[i].sender._id !== userId
  );
};

//returns true if last message is of another sender
export const isLastMessage = (messages, i, userId) => {
  return i === messages.length - 1 && messages[i].sender._id !== userId;
};

//Gives 33px marginLeft to thost chats which is not the last message of another sender,
//To last message of another sender, gives 0 marginLeft as 33px will be occupied by avatar
//if it is user's message, provides marginLeft auto and pushes right
export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender_id === m.sender_id;
};
