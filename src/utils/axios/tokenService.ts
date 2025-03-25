import { LoginResponse } from "@/types/LoginResponse.type";
import Cookies from "js-cookie";
import { AUTH_CONSTANTS } from "./constants";

export const tokenService = {
  setTokens: (tokens: LoginResponse) => {
    Cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN, tokens.access_token, {
      expires: AUTH_CONSTANTS.COOKIE_EXPIRES,
    });
    Cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN, tokens.refresh_token, {
      expires: AUTH_CONSTANTS.COOKIE_EXPIRES,
      path: "/",
    });
    Cookies.set(AUTH_CONSTANTS.IS_AUTHENTICATED, "true", {
      expires: AUTH_CONSTANTS.COOKIE_EXPIRES,
    });
  },

  clearTokens: () => {
    Cookies.remove(AUTH_CONSTANTS.ACCESS_TOKEN);
    Cookies.remove(AUTH_CONSTANTS.REFRESH_TOKEN);
    Cookies.remove(AUTH_CONSTANTS.IS_AUTHENTICATED);
  },

  getAccessToken: () => Cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN),
  getRefreshToken: () => Cookies.get(AUTH_CONSTANTS.REFRESH_TOKEN),
};

