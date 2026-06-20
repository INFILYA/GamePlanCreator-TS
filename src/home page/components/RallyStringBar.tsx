import { RallyStringDisplay } from "./RallyStringDisplay";

type TRallyStringBarProps = {
  notation: string;
};

export function RallyStringBar({ notation }: TRallyStringBarProps) {
  return (
    <div className="rally-string-bar-wrapper">
      <div className="rally-string-bar-label">Rally string</div>
      <RallyStringDisplay
        notation={notation}
        emptyLabel="— add actions below —"
      />
    </div>
  );
}
