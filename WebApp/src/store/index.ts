// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// 👉 Type für den kompletten Redux State
export type RootState = ReturnType<typeof store.getState>;

// 👉 Type für Dispatch
export type AppDispatch = typeof store.dispatch;
