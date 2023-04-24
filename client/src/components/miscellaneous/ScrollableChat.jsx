import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
} from "../../config/chatLogics";
import { useSelector } from "react-redux";
import { Avatar, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
  const { user } = useSelector((state) => state.auth);
  return (
    //[m1, m2, m3...]
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {/* Checking whether it is last message of a sender or the last message is of another sender or not */}
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip
                label={m.sender.name}
                placement={"bottom-start"}
                hasArrow
              >
                <Avatar
                  mt={"7px"}
                  mr={1}
                  size={"sm"}
                  cursor={"pointer"}
                  name={m.sender.name}
                  src={m.sender.picture}
                />
              </Tooltip>
            )}
            <span
              style={{
                color: "black",
                backgroundColor: `${
                  m.sender._id === user._id ? "#03DAC5" : "#99FF99"
                }`,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
