import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
let id = 0;
export const getUniqueId = function () {
  return `r_Id:${id++}`;
};
