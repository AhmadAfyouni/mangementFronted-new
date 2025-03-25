import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  isLightMode: boolean;
}

const initialState: ThemeState = {
  isLightMode: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isLightMode = !state.isLightMode;
      if (state.isLightMode) {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    },
    setTheme(state, action: PayloadAction<boolean>) {
      state.isLightMode = action.payload;
      if (action.payload) {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
