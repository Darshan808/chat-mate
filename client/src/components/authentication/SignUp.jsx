import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Outlet, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getUser } from "../../Store/authSlice";

const SignUP = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [picture, setPicture] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const toast = useToast();

  const handleClick = () => setShow(!show);

  const postDetails = (pics) => {
    setIsLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dweawvcnj");
      fetch("https://api.cloudinary.com/v1_1/dweawvcnj/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPicture(data.url.toString());
          console.log(data.url.toString());
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setIsLoading(false);
      return;
    }
  };

  const submitHandler = async () => {
    setIsLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not Match!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(
        "/api/user/register",
        {
          name,
          email,
          password,
          picture,
        },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );
      console.log("at post", picture);
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      Cookies.set("token", data.token);
      dispatch(getUser(data));
      setIsLoading(false);
      <Navigate to={"/chats"} />;
      return;
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setIsLoading(false);
      return;
    }
  };

  return (
    <>
      <VStack spacing={"5px"}>
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            value={name}
            placeholder="Enter Your Name"
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            value={email}
            placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
            type={"email"}
          />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              value={password}
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
            />
            <InputRightElement width={"4.5rem"}>
              <Button
                h="1.75rem"
                size="sm"
                onClick={handleClick}
                bg={"#222831"}
                _hover={{ bg: "#808080" }}
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="confirm-password" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              value={confirmPassword}
              placeholder="Confirm Your Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={show ? "text" : "password"}
            />
            <InputRightElement width={"4.5rem"}>
              <Button
                h="1.75rem"
                size="sm"
                onClick={handleClick}
                bg={"#222831"}
                _hover={{ bg: "#808080" }}
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="pic">
          <FormLabel>Upload Your Picture</FormLabel>
          <Input
            mb={15}
            type={"file"}
            p={1.5}
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </FormControl>
        <Button
          isLoading={isLoading}
          colorScheme={"purple"}
          width={"100%"}
          marginTop={15}
          onClick={submitHandler}
        >
          Sign Up
        </Button>
      </VStack>
      <Outlet />
    </>
  );
};

export default SignUP;
