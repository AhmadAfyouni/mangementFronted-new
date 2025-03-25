/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldErrors, FieldError } from "react-hook-form";

type ErrorMessageConfig = {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
};

type ErrorHandlerOptions = {
  errors: FieldErrors;
  setSnackbarConfig?: React.Dispatch<React.SetStateAction<ErrorMessageConfig>>;
};

const getErrorMessages = ({
  errors,
  setSnackbarConfig,
}: ErrorHandlerOptions): string[] => {
  const errorMessages: string[] = [];

  const processError = (error: FieldError | undefined) => {
    if (error) {
      errorMessages.push(`${error.message}`);
    }
  };

  const processArrayErrors = (errorArray: any[]) => {
    errorArray.forEach((itemError) => {
      Object.keys(itemError || {}).forEach((key) => {
        processError(itemError[key]);
      });
    });
  };

  Object.keys(errors).forEach((fieldKey) => {
    const error = errors[fieldKey];

    // Check if it's an array field error
    if (Array.isArray(error)) {
      processArrayErrors(error);
    } else {
      // Single field error
      processError(error as FieldError);
    }
  });

  if (errorMessages.length > 0 && setSnackbarConfig) {
    setSnackbarConfig({
      open: true,
      message: errorMessages.join("_____"),
      severity: "error",
    });
  }

  return errorMessages;
};

export default getErrorMessages;
