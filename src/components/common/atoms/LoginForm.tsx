"use client";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { loginSchema } from "@/schemas/login.schema";
import { loginUser } from "@/state/slices/userSlice";
import { AppDispatch } from "@/state/store";
import { LoginFormInputs } from "@/types/Login.type";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import PendingLogic from "./ui/PendingLogic";
import { useRedux } from "@/hooks/useRedux";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setEmpId: Dispatch<SetStateAction<string>>;
}

const LoginForm = ({ setIsModalOpen, setEmpId }: LoginFormProps) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { setSnackbarConfig } = useMokkBar();
  const { selector: isLoading } = useRedux((state) => state.user.loading);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      if (result.status === true) {
        router.replace(localStorage.getItem("selectedTab") || "/home");
      }
      setSnackbarConfig({
        open: true,
        message: t("Login successful"),
        severity: "success",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error?.message || error;
      console.log("new  error message is : ", errorMessage);
      if (
        errorMessage?.startsWith(
          "You must change your password on the first login"
        )
      ) {
        const empId = errorMessage.split(",")[1];
        setEmpId(empId);
        setIsModalOpen(true);
      } else {
        setSnackbarConfig({
          open: true,
          message: errorMessage || t("Login failed"),
          severity: "error",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center border rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-center p-3">
            <Mail className="text-gray-400 w-5 h-5" />
          </div>
          <input
            type="email"
            {...register("email")}
            className={`flex-1 py-3 outline-none ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
            placeholder={t("Email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center border rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-center p-3">
            <Lock className="text-gray-400 w-5 h-5" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`flex-1 py-3 outline-none ${
              errors.password ? "border-red-500" : "border-gray-200"
            }`}
            placeholder={t("Password")}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="flex items-center justify-center p-3 text-gray-400 hover:text-gray-600 
              focus:outline-none transition-colors select-none"
            tabIndex={0}
            aria-label={showPassword ? t("Hide password") : t("Show password")}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-tblack text-white hover:bg-secondary hover:text-tmid disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PendingLogic
          isPending={isLoading}
          normalText="Login"
          pendingText="Logging in..."
        />
      </button>
    </form>
  );
};

export default LoginForm;
