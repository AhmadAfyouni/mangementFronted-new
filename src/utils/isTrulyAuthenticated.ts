import { tokenService } from "@/utils/axios/tokenService";
import { RootState } from "@/state/store";

export function isTrulyAuthenticated(state: RootState) {
  return (
    !!tokenService.getAccessToken() &&
    !!tokenService.getRefreshToken() &&
    state.user.isAuthenticated
  );
}
