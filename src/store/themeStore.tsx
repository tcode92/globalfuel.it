import { create } from "zustand";
type Theme = "dark" | "base";
type ThemeStore = {
  theme: Theme | null;
  setTheme: (t: Theme | null) => void;
};
export const useTheme = create<ThemeStore>((set, get) => ({
  theme: getLocalTheme(),
  setTheme: (theme: Theme | null) => {
    setLocalTheme(theme);
    const html = document.querySelector("html");
    if (html) {
      if (theme === "dark") {
        html.classList.add(theme);
      } else {
        html.classList.remove("dark");
      }
    }
    set({
      theme,
    });
  },
}));

function getLocalTheme(): Theme {
  if (typeof window === "undefined") return "base";
  const t = localStorage.getItem("theme") as Theme | null;
  const html = document.querySelector("html");
  if (html) {
    if (t === "dark") {
      html.classList.add(t);
    } else {
      html.classList.remove("dark");
    }
  }
  return t ?? "base";
}
function setLocalTheme(theme: Theme | null) {
  if (theme) {
    localStorage.setItem("theme", theme);
  } else {
    localStorage.removeItem("theme");
  }
}
