import { useContext } from "react";

import ThemeContext from "@/context/ThemeContext";

const useTheme = () => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return themeContext;
};

export default useTheme;
