import { RootState } from "@/state/store";
import { useEffect } from "react";
import { useRedux } from "./useRedux";
import { setTheme, toggleTheme } from "@/state/slices/themeSlice";

const useCustomTheme = () => {
  const {
    selector: isLightMode,
    dispatch,
    dispatchAction,
  } = useRedux((state: RootState) => state.theme.isLightMode);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [isLightMode]);

  const toggleThemes = () => {
    dispatch(toggleTheme());
  };
  const setThemes = (isLight: boolean) => {
    dispatchAction(setTheme, isLight);
  };

  return { isLightMode, toggleThemes, setThemes };
};

export default useCustomTheme;
