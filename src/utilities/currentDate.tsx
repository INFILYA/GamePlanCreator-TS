import { TOptions } from "./SetDate";

export function currentDate() {
  const date = new Date();
  const options: TOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const currentDate = date.toLocaleDateString("en-US", options);
  return currentDate;
}
