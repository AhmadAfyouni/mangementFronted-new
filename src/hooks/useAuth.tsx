"use client";
import { refreshAuthToken } from "@/state/slices/userSlice";
import { AppDispatch, RootState } from "@/state/store";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const router = useRouter();
  const { loading, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const dispatch = useDispatch<AppDispatch>();

  const checkAuth = useCallback(async () => {
    const refreshToken = Cookies.get("refresh_token");

    if (!refreshToken) {
      return router.replace("/auth");
    }

    try {
      await dispatch(refreshAuthToken()).unwrap();
    } catch (error) {
      console.error("Authentication error:", error);
      Cookies.remove("refresh_token");
      Cookies.remove("access_token");
      router.push("/auth");
    }
  }, [dispatch, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, loading };
};
