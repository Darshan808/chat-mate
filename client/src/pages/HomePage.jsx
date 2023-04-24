import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { Outlet } from "react-router-dom";
import SignUP from "../components/authentication/SignUp";
import Login from "../components/authentication/Login";

const HomePage = () => {
  return (
    <>
      <Container maxW={"xl"} centerContent>
        <Box
          display={"flex"}
          justifyContent={"center"}
          p={3}
          // bg={"white"}
          w={"100%"}
          m="40px 0 15px 0"
          borderRadius={"lg"}
          // borderWidth={"1px"}
          color={"white"}
          bg={"#393E46"}
        >
          <Text fontSize={"4xl"} fontFamily={"Work sans"}>
            Chat-Mate
          </Text>
        </Box>
        <Box
          // bg={"white"}
          w={"100%"}
          p={4}
          borderRadius={"lg"}
          // borderWidth={"1px"}
          // color={"black"}
          color={"white"}
          bg={"#393E46"}
        >
          <Tabs variant="soft-rounded" colorScheme="purple">
            <TabList mb={"1rem"}>
              <Tab width={"50%"} color={"#E0E1E4"}>
                Login
              </Tab>
              <Tab width={"50%"} color={"#E0E1E4"}>
                Sign Up
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <SignUP />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>

      <Outlet />
    </>
  );
};

export default HomePage;
