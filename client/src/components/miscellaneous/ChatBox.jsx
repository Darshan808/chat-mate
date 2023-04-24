import React, { useEffect, useState } from "react";
import { setSelectedChat } from "../../Store/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { getSender } from "../../config/chatLogics";
import { getSenderFull } from "../../config/chatLogics";
import { ProfileModal } from "./Modals/profileModal";
import UpdateGroupChatModal from "./Modals/UpdateGroupChatModal";
import Cookies from "js-cookie";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../../animations/typingAnimation.json";
import { setUnreadMessages } from "../../Store/chatSlice";

const ENDPOINT = "http://localhost:4000";
var socket, selectedChatCompare;

const ChatBox = ({ fetchChats }) => {
  const dispatch = useDispatch();
  const token = Cookies.get("token");
  const toast = useToast();
  const { selectedChat, unreadMessages } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRation: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat._id) return;
    try {
      setLoadingChat(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setLoadingChat(false);
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Failed to send the Message!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (e) => {
    if (e.type === "keydown" && e.key !== "Enter") {
      return;
    }
    try {
      socket.emit("stop typing", selectedChat._id);
      showEmoji && setShowEmoji(false);
      const { data } = await axios.post(
        "/api/message",
        {
          chatId: selectedChat._id,
          content: newMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewMessage("");
      socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Failed to send the Message!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageReceived) => {
      if (
        !selectedChatCompare._id ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        dispatch(setUnreadMessages([newMessageReceived, ...unreadMessages]));
        fetchChats();
      } else {
        addMessage(newMessageReceived);
      }
    });
  });

  const addMessage = (newMessage) => {
    setMessages([...messages, newMessage]);
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    // Typing Indicator Logic
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chat: selectedChat, userId: user._id });
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  const emojiHandler = (emojiObject) => {
    setNewMessage(newMessage + emojiObject.emoji);
  };

  return (
    <Box
      display={{
        base: selectedChat._id ? "flex" : "none",
        md: "flex",
      }}
      alignItems={"center"}
      flexDir={"column"}
      p={3}
      bg={"#222831"}
      color={"white"}
      w={{ base: "100%", md: "69%" }}
      borderRadius={"lg"}
    >
      {!selectedChat._id ? (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"100%"}
          w={"100%"}
          bg={"#393E46"}
          borderRadius={"lg"}
        >
          <Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
            Click on a user to start chatting
          </Text>
        </Box>
      ) : (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => dispatch(setSelectedChat({}))}
              bg={"#393E46"}
              _hover={{ bg: "#808080" }}
            />
            {selectedChat.isGroupChat ? (
              <>
                {selectedChat.chatName}
                <UpdateGroupChatModal fetchChats={fetchChats} />
              </>
            ) : (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#393E46"}
            color={"black"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"hidden"}
            onKeyDown={sendMessage}
          >
            {loadingChat ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf={"center"}
                margin={"auto"}
              />
            ) : (
              <div
                className="messages"
                onClick={() => showEmoji && setShowEmoji(false)}
              >
                <ScrollableChat messages={messages} />
              </div>
            )}
            {isTyping ? (
              <div>
                <Lottie
                  options={defaultOptions}
                  width={70}
                  style={{ marginBottom: 15, marginLeft: 10 }}
                />
              </div>
            ) : (
              <></>
            )}
            <Box display={"flex"} mt={3}>
              <Button
                color={"white"}
                bg={"#222831"}
                mr={2}
                px={3}
                onClick={() => setShowEmoji(!showEmoji)}
                fontSize={"xx-large"}
                pb={2}
                _hover={{ bg: "#FFFFE0", color: "black" }}
              >
                ☺
              </Button>
              {showEmoji && (
                <span className="emoji">
                  <EmojiPicker
                    theme="dark"
                    width={300}
                    height={350}
                    onEmojiClick={emojiHandler}
                  />
                </span>
              )}
              <FormControl color={"white"}>
                <Input
                  placeholder="Enter a message..."
                  autoComplete={"off"}
                  bg={"#393E46"}
                  borderWidth={1}
                  borderColor={"white"}
                  onChange={typingHandler}
                  value={newMessage}
                />
              </FormControl>
              <IconButton
                icon={<ArrowRightIcon />}
                colorScheme="purple"
                ml={2}
                px={5}
                onClick={sendMessage}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ChatBox;
