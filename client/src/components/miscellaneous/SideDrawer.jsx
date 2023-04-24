import {
  Box,
  Button,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Avatar,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { SearchIcon, BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { logout } from "../../Store/authSlice";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ProfileModal } from "./Modals/profileModal";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import UserListItem from "../userAvatar/UserListItem";
import {
  setSelectedChat,
  setChats,
  setUnreadMessages,
} from "../../Store/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import { emptyEverything } from "../../Store/chatSlice";
import { getSender } from "../../config/chatLogics";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";

const SideDrawer = () => {
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { chats, unreadMessages } = useSelector((state) => state.chat);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  function handleLogout() {
    dispatch(logout());
    dispatch(emptyEverything());
    Cookies.remove("token");
    <Navigate to={"/"} />;
  }

  async function handleSearch(value) {
    if (!value) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user?search=${value}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        discription: "Failed to load the search results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  }
  async function accessChat(userId) {
    try {
      setLoadingChat(true);
      const { data } = await axios.post(
        "/api/chat",
        {
          userId,
        },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoadingChat(false);
      if (!chats.find((c) => c._id === data._id)) {
        dispatch(setChats([...chats, data]));
      }
      dispatch(setSelectedChat(data));
    } catch (error) {
      toast({
        title: "Error Occured!",
        discription: "Failed to access the chat",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  }
  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"#222831"}
        w={"100%"}
        p={"5px 10px"}
        borderBottom={"3px solid #393E46"}
        borderRadius={"lg"}
        color={"white"}
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            variant={"ghost"}
            _hover={{ bg: "#808080" }}
            onClick={() => {
              setSearch("");
              setSearchResult([]);
              onOpen();
            }}
          >
            <SearchIcon />
            <Text display={{ base: "none", md: "flex" }} px={"4"}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize={"2xl"} fontFamily={"Work-sans"}>
          Chat-Mate
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={unreadMessages.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize={"2xl"} m={1} />
            </MenuButton>
            <MenuList bg={"#393E46"} pl={2}>
              {!unreadMessages.length && "No New Messages"}
              {unreadMessages.map((message) => (
                <MenuItem
                  key={message._id}
                  bg={"#393E46"}
                  _hover={{ bg: "#808080" }}
                  onClick={() => {
                    dispatch(setSelectedChat(message.chat));
                    dispatch(
                      setUnreadMessages(
                        unreadMessages.filter((m) => m._id !== message._id)
                      )
                    );
                  }}
                >
                  {message.chat.isGroupChat
                    ? `${message.chat.chatName}`
                    : `New Message from ${
                        getSender(user, message.chat.users).split(" ")[0]
                      }`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bg={"#393E46"}
              _hover={{ bg: "#808080" }}
            >
              <Avatar
                size={"sm"}
                cursor={"pointer"}
                name={user.name}
                src={user.picture}
              />
            </MenuButton>
            <MenuList bg={"#393E46"}>
              <ProfileModal user={user}>
                <MenuItem bg={"#393E46"} _hover={{ bg: "#808080" }}>
                  My Profile
                </MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem
                onClick={handleLogout}
                bg={"#393E46"}
                _hover={{ bg: "#808080" }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent color={"white"} background={"#393E46"}>
          <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display={"flex"} pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
            </Box>
            {loading ? (
              <ChatLoading />
            ) : search && searchResult.length == 0 ? (
              "No matching users found!"
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => {
                    onClose();
                    accessChat(user._id);
                  }}
                />
              ))
            )}
          </DrawerBody>
          {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
