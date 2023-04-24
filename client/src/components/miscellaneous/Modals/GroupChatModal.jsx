import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import Cookies from "js-cookie";
import UserListItem from "../../userAvatar/UserListItem";
import UserBadgeItem from "../../userAvatar/UserBadgeItem";
import { setSelectedChat, setChats } from "../../../Store/chatSlice";
import { useSelector, useDispatch } from "react-redux";

const GroupChatModal = ({ children }) => {
  const token = Cookies.get("token");
  const toast = useToast();
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chat);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  async function handleUserSearch(query) {
    if (!query) {
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user?search=${query}`, {
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
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  }
  async function handleCreateChat() {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Error Occured!",
        discription: "Please Fill all the Feilds",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }
    try {
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "Application/json",
          },
        }
      );
      dispatch(setChats([data, ...chats]));
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      dispatch(setSelectedChat(data));
    } catch (error) {
      toast({
        title: "Error Occured!",
        discription: error.response.data,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }
  function addToGroup(user) {
    if (selectedUsers.includes(user)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, user]);
  }
  function handleDelete(userToDelete) {
    setSelectedUsers(
      selectedUsers.filter((users) => users._id !== userToDelete._id)
    );
  }
  return (
    <>
      <span
        onClick={() => {
          setGroupChatName("");
          setSearchResult([]);
          setSelectedUsers([]);
          onOpen();
        }}
      >
        {children}
      </span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent color={"white"} bg={"#393E46"}>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
            <FormControl>
              <FormLabel>Group Chat Name</FormLabel>
              <Input
                value={groupChatName}
                placeholder="Group Chat Name"
                onChange={(e) => setGroupChatName(e.target.value)}
                type={"text"}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Add Users</FormLabel>
              <Input
                placeholder="eg: John, Piyush, Jane"
                onChange={(e) => handleUserSearch(e.target.value)}
                type={"text"}
              />
            </FormControl>
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"}>
              {selectedUsers.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>
            {loading ? (
              <div>Loading...</div>
            ) : (
              searchResult?.slice(0, 4).map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => {
                    addToGroup(user);
                  }}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateChat}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
