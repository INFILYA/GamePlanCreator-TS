export type TOptions = {
  day: "numeric" | "2-digit" | undefined;
  month: "numeric" | "2-digit" | "short" | "long" | "narrow" | undefined;
  year: "numeric" | "2-digit" | undefined;
  hour?: "numeric" | "2-digit" | undefined;
  minute?: "numeric" | "2-digit" | undefined;
};

export function SetDate() {
  const date = new Date();
  const options: TOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const Data = date.toLocaleDateString("en-US", options);
  return (
    <div className="set-date-wrapper">
      <h2 className="set-date-text">{Data}</h2>
    </div>
  );
}
