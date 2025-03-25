import { AppDispatch } from "@/state/store";
import { Dispatch, SetStateAction } from "react";

export interface LoginFormInputs {
  email: string;
  password: string;
}

export interface ChangePasswordFormInputs {
  newPassword: string;
  confirmPassword: string;
}

export interface LoginServiceOptions {
  data: LoginFormInputs;
  dispatch: AppDispatch;
  setSnackbarConfig: Dispatch<
    SetStateAction<{
      open: boolean;
      message: string;
      severity: "success" | "info" | "warning" | "error";
    }>
  >;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setEmpId: Dispatch<SetStateAction<string>>;
}
// wow


