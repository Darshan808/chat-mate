import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "../../Store/chatSlice";
import { Box, Button, Stack, Text, Avatar } from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender, getSenderFull } from "../../config/chatLogics";
import GroupChatModal from "./Modals/GroupChatModal";

const MyChats = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedChat, chats } = useSelector((state) => state.chat);

  return (
    <Box
      display={{
        base: selectedChat._id ? "none" : "flex",
        md: "flex",
      }}
      flexDir={"column"}
      alignItems={"center"}
      p={3}
      bg={"#222831"}
      w={{ base: "100%", md: "31%" }}
      borderRadius={"lg"}
      color={"white"}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily={"Work sans"}
        display={"flex"}
        w={"100%"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        My Chats
        <GroupChatModal>
          <Button
            display={"flex"}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            bg={"#393E46"}
            _hover={{ bg: "#808080" }}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display={"flex"}
        flexDir={"column"}
        p={3}
        bg={"#222831"}
        w={"100%"}
        h={"100%"}
        borderRadius={"lg"}
        overflow={"hidden"}
      >
        {chats ? (
          <Stack overflowY={"scroll"}>
            {chats.map((chat) => (
              <Box
                display={"flex"}
                onClick={() => dispatch(setSelectedChat(chat))}
                cursor={"pointer"}
                bg={selectedChat._id === chat._id ? "#38B2AC" : "#393E46"}
                color={"white"}
                px={3}
                py={2}
                borderRadius={"lg"}
                key={chat._id}
                _hover={{ bg: selectedChat._id !== chat._id && "#525252" }}
              >
                <Avatar
                  mr={2}
                  size={"md"}
                  cursor={"pointer"}
                  name={
                    chat.isGroupChat
                      ? chat.chatName
                      : getSenderFull(user, chat.users).name
                  }
                  src={
                    !chat.isGroupChat && getSenderFull(user, chat.users).picture
                  }
                />
                <Box>
                  <Text fontSize={"xl"}>
                    {chat.isGroupChat
                      ? chat.chatName
                      : getSender(user, chat.users)}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="sm">
                      <b>{chat.latestMessage.sender.name.split(" ")[0]} : </b>
                      {chat.latestMessage.content.length > 30
                        ? chat.latestMessage.content.substring(0, 30) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
