/* eslint-disable @typescript-eslint/no-explicit-any */
import { loginUser } from "@/state/slices/userSlice";
import { AppDispatch } from "@/state/store";
import { LoginFormInputs, LoginServiceOptions } from "@/types/Login.type";

export const login = async (data: LoginFormInputs, dispatch: AppDispatch) => {
  try {
    const result = await dispatch(loginUser(data)).unwrap();
    return { success: true, result };
  } catch (error) {
    throw error;
  }
};

export const handleLogin = async ({
  data,
  dispatch,
  setSnackbarConfig,
  setIsModalOpen,
  setEmpId,
}: LoginServiceOptions) => {
  try {
    await dispatch(loginUser(data)).unwrap();

    return { success: true };
  } catch (error: any) {
    console.log(error);

    setEmpId(error.split(",")[1]);
    if (error.startsWith("You must change your password on the first login")) {
      setEmpId(error.split(",")[1]);
      setIsModalOpen(true);
    } else {
      console.error("Login failed", error);
      setSnackbarConfig({
        open: true,
        message: "Login failed. Please check your credentials.",
        severity: "error",
      });
    }

    return { success: false };
  }
};
