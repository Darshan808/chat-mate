import React, { useEffect } from "react";
import { Box, useToast } from "@chakra-ui/react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import ChatBox from "../components/miscellaneous/ChatBox";
import MyChats from "../components/miscellaneous/MyChats";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setChats, setSelectedChat } from "../Store/chatSlice";

const Chats = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const token = Cookies.get("token");
  const { selectedChat } = useSelector((state) => state.chat);
  const fetchChats = async () => {
    try {
      const { data } = await axios.get("/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(setChats(data));
      data.map((chat) => {
        if (selectedChat._id === chat._id) {
          dispatch(setSelectedChat(chat));
          return;
        }
        return;
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  useEffect(() => {
    fetchChats();
  }, []);
  return (
    <div style={{ width: "100%" }}>
      <SideDrawer />
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        w={"100%"}
        h={"91.5vh"}
      >
        <MyChats fetchChats={fetchChats} />
        <ChatBox fetchChats={fetchChats} />
      </Box>
    </div>
  );
};

export default Chats;
