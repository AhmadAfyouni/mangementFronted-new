export type Severity = "success" | "error" | "warning" | "info";

export interface SnackbarConfig {
  open: boolean;
  message: string;
  severity: Severity;
}

export interface MokkBarContextType {
  snackbarConfig: SnackbarConfig;
  setSnackbarConfig: React.Dispatch<React.SetStateAction<SnackbarConfig>>;
}
export const defaultConfig: SnackbarConfig = {
  open: false,
  message: "",
  severity: "info",
};