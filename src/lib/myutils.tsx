import { useTheme } from "@/store/themeStore";
import { toast, TypeOptions } from "react-toastify";

export function showMsg(msg: string | string[], type: TypeOptions = "default", timeout?: number) {
  const message = Array.isArray(msg) ? msg.map((m, i) => <p key={i}>{m}</p>) : msg
  toast(<div className="text-black dark:text-white text-sm">{message}</div>, {
    autoClose: timeout,
    type,
    hideProgressBar: true,
    position: "top-left",
    theme: useTheme.getState().theme === "dark" ? "dark" : "light"
  })
}