import { RegularButton } from "../css/Button.styled";

type TConfirmField = {
  onClick(): void;
  setOpenConfirmWindow(arg: boolean): void;
};

export default function ConfirmField(arg: TConfirmField) {
  const { onClick, setOpenConfirmWindow } = arg;
  return (
    <div className="hideBackground">
      <div className="confirmationForExit">
        <div>
          <h2>Are you sure?</h2>
          <RegularButton type="button" onClick={onClick} $color="#0057b8" $background="#ffd700">
            Yes
          </RegularButton>
          <RegularButton
            type="button"
            onClick={() => setOpenConfirmWindow(false)}
            $color="#0057b8"
            $background="#ffd700"
          >
            No
          </RegularButton>
        </div>
      </div>
    </div>
  );
}
