// hooks/useSessionStorageCleanup.ts
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface UseSessionStorageCleanupProps {
  keys: string[]; // Keys to clear from session storage
  onCleanup?: () => void; // Optional callback after cleanup
}

const useSessionStorageCleanup = ({
  keys,
  onCleanup,
}: UseSessionStorageCleanupProps) => {
  const pathname = usePathname();

  useEffect(() => {
    const clearStorage = () => {
      keys.forEach((key) => {
        sessionStorage.removeItem(key);
      });
      onCleanup?.();
    };

    // Handle browser back/forward buttons and page unload
    const handleBeforeUnload = () => {
      clearStorage();
    };

    // Add event listener for page unload
    window.addEventListener("popstate", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("popstate", handleBeforeUnload);
      clearStorage();
    };
  }, [keys, onCleanup]);

  // Handle route changes
  useEffect(() => {
    const clearStorage = () => {
      keys.forEach((key) => {
        sessionStorage.removeItem(key);
      });
      onCleanup?.();
    };

    // Clear storage on route change
    clearStorage();
  }, [pathname, keys, onCleanup]);
};

export default useSessionStorageCleanup;
