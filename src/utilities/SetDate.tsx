type TOptions = {
  day: "numeric" | "2-digit" | undefined;
  month: "numeric" | "2-digit" | "short" | "long" | "narrow" | undefined;
  year: "numeric" | "2-digit" | undefined;
};

export function SetDate() {
  const date = new Date();
  const options: TOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const Data = date.toLocaleDateString("en-US", options);
  return (
    <div style={{ marginRight: "1vw" }}>
      <h2>{Data}</h2>
    </div>
  );
}
