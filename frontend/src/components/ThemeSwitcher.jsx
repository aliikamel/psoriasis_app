// ThemeSwitcher.jsx
import React from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { useTheme } from "./ThemeContext"; // Adjust the import path as needed

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const toggleDarkMode = (checked) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <DarkModeSwitch checked={isDarkMode} onChange={toggleDarkMode} size={30} />
  );
};

export default ThemeSwitcher;
