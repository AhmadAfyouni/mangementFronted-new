import * as React from "react";
import toast from "react-hot-toast";
import { CustomizedSnackbarsProps } from "@/types/Snackbar.type";

const CustomizedSnackbars: React.FC<CustomizedSnackbarsProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  React.useEffect(() => {
    if (open) {
      const toastId = toast[severity === 'error' ? 'error' : severity === 'warning' ? 'error' : severity === 'info' ? 'success' : 'success'](message, {
        duration: 2000,
      });

      // Set up a timeout to call onClose after the toast duration
      const timeoutId = setTimeout(() => {
        onClose();
      }, 2000);

      return () => {
        toast.dismiss(toastId);
        clearTimeout(timeoutId);
      };
    }
  }, [open, message, severity, onClose]);

  return null;
};

export default CustomizedSnackbars;
