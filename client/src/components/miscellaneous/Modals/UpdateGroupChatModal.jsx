import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  FormLabel,
} from "@chakra-ui/react";
import { useDisclosure, Button } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { setSelectedChat } from "../../../Store/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import UserBadgeItem from "../../userAvatar/UserBadgeItem";
import axios from "axios";
import UserListItem from "../../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchChats }) => {
  const token = Cookies.get("token");
  const toast = useToast();
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  async function handleRename() {
    if (!groupChatName) {
      return;
    }
    try {
      setRenameLoading(true);
      const { data } = await axios.patch(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        {
          headers: {
            "Content-Type": "Application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setSelectedChat(data));
      fetchChats();
      setRenameLoading(false);
      onClose();
      toast({
        title: "Group chat renamed Successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
  }
  async function handleUserSearch(query) {
    setSearch(query);
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
      setSearchResults(data);
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
  async function handleRemove(userToRemove) {
    if (
      userToRemove._id !== user._id &&
      user._id !== selectedChat.groupAdmin._id
    ) {
      toast({
        title: "No Admin Privileges!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        {
          headers: {
            "Content-Type": "Application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchChats();
      if (userToRemove._id === user._id) {
        onClose();
        dispatch(setSelectedChat({}));
        toast({
          title: "You Left the Group",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-left",
        });
        return;
      }
      toast({
        title: `${userToRemove.name} removed from group`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
  }
  async function addToGroup(userToAdd) {
    console.log(selectedChat.users.includes(userToAdd._id));

    if (
      selectedChat.users.filter(function (u) {
        return u._id === userToAdd._id;
      }).length > 0
    ) {
      toast({
        title: "User already exists",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        {
          headers: {
            "Content-Type": "Application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchChats();
      toast({
        title: `${userToAdd.name} added to the group`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  }
  return (
    <>
      <IconButton
        colorScheme="black"
        _hover={{ bg: "#808080" }}
        display={{ base: "flex" }}
        icon={<InfoIcon fontSize={"lg"} />}
        onClick={() => {
          setGroupChatName("");
          setSearchResults([]);
          setSearch("");
          onOpen();
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent color={"white"} background={"#393E46"}>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Rename Group Chat</FormLabel>
              <Box display={"flex"}>
                <Input
                  placeholder="Chat Name"
                  mb={3}
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  variant={"solid"}
                  colorScheme="teal"
                  borderRadius={"lg"}
                  ml={1}
                  isLoading={renameLoading}
                  onClick={handleRename}
                >
                  Change
                </Button>
              </Box>
            </FormControl>
            {user._id === selectedChat.groupAdmin._id ? (
              <>
                <FormControl>
                  <FormLabel>Add Users to Group</FormLabel>
                  <Box display={"flex"}>
                    <Input
                      placeholder="Add more users"
                      mb={3}
                      value={search}
                      onChange={(e) => handleUserSearch(e.target.value)}
                    />
                    <Button
                      variant={"solid"}
                      colorScheme="teal"
                      borderRadius={"lg"}
                      ml={1}
                      isLoading={renameLoading}
                      onClick={() => handleUserSearch(search)}
                    >
                      Add
                    </Button>
                  </Box>
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
                    searchResults?.slice(0, 4).map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => {
                          addToGroup(user);
                        }}
                      />
                    ))
                  )}
                </FormControl>
                <FormLabel>Remove Group Members</FormLabel>
              </>
            ) : (
              <FormLabel>Group Members</FormLabel>
            )}
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"}>
              {selectedChat.users.map(
                (groupUser) =>
                  groupUser._id !== user._id && (
                    <UserBadgeItem
                      key={groupUser._id}
                      user={groupUser}
                      handleFunction={() => handleRemove(groupUser)}
                    />
                  )
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
