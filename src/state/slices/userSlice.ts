/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoginResponse, UserType } from "@/types/LoginResponse.type";
import { authService } from "@/utils/axios/usage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface UserState {
  userInfo: UserType | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  refresh_token: string | null;
  role: string | null;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  token: null,
  refresh_token: null,
  role: null,
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>("user/loginUser", async (userData, { rejectWithValue }) => {
  try {
    return await authService.login(userData);
  } catch (error: any) {
    console.log("Failed to login with error : ", error);

    return rejectWithValue(error.message || "Failed to login");
  }
});

export const refreshAuthToken = createAsyncThunk<
  LoginResponse,
  void,
  { rejectValue: string }
>("user/refreshAuthToken", async (_, { rejectWithValue }) => {
  try {
    return await authService.refreshToken();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to refresh token"
    );
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLaoding: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.token = null;
      state.refresh_token = null;
      state.error = null;
      state.role = null;
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      Cookies.remove("is_authenticated");
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.token = null;
        state.refresh_token = null;
        state.role = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.userInfo = {
            ...action.payload.user,
          };
          state.isAuthenticated = true;
          state.token = action.payload.access_token;
          state.refresh_token = action.payload.refresh_token;
          state.role = action.payload.role;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(refreshAuthToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        refreshAuthToken.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.userInfo = {
            ...action.payload.user,
          };
          state.isAuthenticated = true;
          state.token = action.payload.access_token;
          state.refresh_token = action.payload.refresh_token;
          state.role = action.payload.role;
        }
      )
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.refresh_token = null;
        state.error = action.payload || "Failed to refresh token";
      });
  },
});

export const { logout, setLaoding } = userSlice.actions;
export default userSlice.reducer;
