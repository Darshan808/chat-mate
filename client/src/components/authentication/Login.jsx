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
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { getUser } from "../../Store/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setIsLoading(true);
    if (!email || !password) {
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

    try {
      const { data } = await axios.post(
        "/api/user/login",
        {
          email,
          password,
        },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );
      toast({
        title: "Login Successful",
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
        <FormControl id="email">
          <FormLabel>Email</FormLabel>
          <Input
            id="login-email"
            value={email}
            placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
            type={"email"}
          />
        </FormControl>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <InputGroup mb={15}>
            <Input
              id="login-password"
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
        <Button
          isLoading={isLoading}
          colorScheme={"purple"}
          width={"100%"}
          onClick={submitHandler}
        >
          Login
        </Button>
        <Button
          variant={"solid"}
          colorScheme={"teal"}
          width={"100%"}
          onClick={() => {
            setEmail("guestUser@example.com");
            setPassword("guest123");
          }}
        >
          Get Guest User Credentials
        </Button>
      </VStack>
      <Outlet />
    </>
  );
};

export default Login;
