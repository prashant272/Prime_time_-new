import { createSlice } from "@reduxjs/toolkit";

const adminInfoFromStorage = localStorage.getItem("adminInfo")
  ? JSON.parse(localStorage.getItem("adminInfo"))
  : null;

const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialState = {
  adminInfo: adminInfoFromStorage,
  userInfo: userInfoFromStorage,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Admin credentials
    setCredentials: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem("adminInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.adminInfo = null;
      localStorage.removeItem("adminInfo");
    },

    // Regular User credentials
    setUserCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    userLogout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setCredentials, logout, setUserCredentials, userLogout } = authSlice.actions;

export default authSlice.reducer;
