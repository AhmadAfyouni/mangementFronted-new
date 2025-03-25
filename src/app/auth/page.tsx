// src/components/Login/Login.tsx
"use client";
import LoginForm from "@/components/common/atoms/LoginForm";
import LoginHeader from "@/components/common/atoms/LoginHeader";
import ChangingPasswordModal from "@/components/common/atoms/modals/ChangingPasswordModal";
import Background from "@/components/common/atoms/ui/Background";
import { useRedux } from "@/hooks/useRedux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Login = () => {
  const { selector } = useRedux((state) => state.user);
  const { error, isAuthenticated } = selector;
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empId, setEmpId] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.replace("/home");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error?.includes("You must change your password on the first login")) {
      const [, extractedEmpId] = error.split(",");
      setEmpId(extractedEmpId);
      setIsModalOpen(true);
    }
  }, [error]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 fixed inset-0 bg-main`}
    >
      <Background />
      <div
        className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-lg bg-dark 
        `}
      >
        <LoginHeader />
        <LoginForm setIsModalOpen={setIsModalOpen} setEmpId={setEmpId} />
      </div>
      <ChangingPasswordModal
        empId={empId}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default Login;
