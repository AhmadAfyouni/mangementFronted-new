// MokkBarContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { SnackbarConfig } from "@/types/DepartmentType.type";
import { MokkBarContextType, defaultConfig } from "@/types/MokkBar.type";
import CustomizedSnackbars from "../common/atoms/ui/CustomizedSnackbars";

const MokkBarContext = createContext<MokkBarContextType | undefined>(undefined);

export const MokkBarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [snackbarConfig, setSnackbarConfig] =
    useState<SnackbarConfig>(defaultConfig);

  useEffect(() => {
    if (snackbarConfig.open) {
      console.log("Snackbar Config:", snackbarConfig);
    }
  }, [snackbarConfig]);

  return (
    <MokkBarContext.Provider value={{ snackbarConfig, setSnackbarConfig }}>
      {children}
      <CustomizedSnackbars
        open={snackbarConfig.open}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
        onClose={() => setSnackbarConfig((prev) => ({ ...prev, open: false }))}
      />
    </MokkBarContext.Provider>
  );
};

export const useMokkBar = () => {
  const context = useContext(MokkBarContext);
  if (!context) {
    throw new Error("useMokkBar must be used within a MokkBarProvider");
  }
  return context;
};
