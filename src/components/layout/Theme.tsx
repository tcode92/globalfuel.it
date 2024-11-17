import { useTheme } from "@/store/themeStore";
import { FiMoon, FiSun } from "react-icons/fi";
import { Button } from "../ui/button";
export default function ThemeColorButton() {
  const { theme, setTheme } = useTheme();
  function toggleTheme() {
    if (theme === "dark") {
      setTheme(null);
    } else {
      setTheme("dark");
    }
  }
  return (
    <Button
      className="rounded-full w-7 h-7"
      variant={"outline"}
      size={"icon"}
      onClick={toggleTheme}
    >
      {theme === "dark" ? <FiMoon /> : <FiSun />}
    </Button>
  );
}

function getLocalTheme() {
  const t = localStorage.getItem("theme");
  return t ?? "";
}
function setLocalTheme(theme: "dark" | null) {
  if (theme) {
    localStorage.setItem("theme", theme);
  } else {
    localStorage.removeItem("theme");
  }
}
