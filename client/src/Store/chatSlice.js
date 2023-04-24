import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedChat: {},
    chats: [],
    unreadMessages: [],
  },
  reducers: {
    setSelectedChat: (state, { payload }) => {
      state.selectedChat = payload;
    },
    setChats: (state, { payload }) => {
      state.chats = payload;
    },
    setUnreadMessages: (state, { payload }) => {
      state.unreadMessages = payload;
    },
    emptyEverything: (state) => {
      state.selectedChat = {};
      state.chats = [];
      state.unreadMessages = [];
    },
  },
});

export const { setSelectedChat, setChats, emptyEverything, setUnreadMessages } =
  chatSlice.actions;

export default chatSlice.reducer;
