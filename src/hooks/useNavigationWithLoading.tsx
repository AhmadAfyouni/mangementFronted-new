"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const useNavigationWithLoading = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const navigateWithLoading = (path: string) => {
    setLoading(true); // Start loading immediately
    router.push(path);
  };

  const replaceWithLoading = (path: string) => {
    setLoading(true); // Start loading immediately
    router.replace(path);
  };

  return { loading, navigateWithLoading, replaceWithLoading };
};

export default useNavigationWithLoading;
