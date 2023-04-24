import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: {},
  },
  reducers: {
    getUser: (state, { payload }) => {
      state.isAuthenticated = true;
      state.user = payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = {};
    },
  },
});

export const { getUser, logout } = authSlice.actions;

export default authSlice.reducer;
