import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectChangeLanguage, setChangeLanguage } from "./states/slices/changeLanguageSlice";
import { Switch } from "antd";
import { setisShowedTutorial } from "./states/slices/isShowedTutorialSlice";
import { useAppDispatch } from "./states/store";
import { backGroundBlue, backGroundYellow, getFromLocalStorage } from "./utilities/functions";
import { RegularButton } from "./css/Button.styled";
import ConfirmField from "./utilities/ConfimField.";

type TTutorial = { text: React.ReactNode; key: number };

export function Tutorial(props: TTutorial) {
  const { text } = props;
  const dispatch = useAppDispatch();
  const changeLanguage = useSelector(selectChangeLanguage);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [confirmRepeat, setConfirmReapeat] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setisShowedTutorial(getFromLocalStorage("isShowedTutorial")));
  }, [dispatch]);
  const buttonUkrStyle = changeLanguage ? backGroundYellow : backGroundBlue;
  const buttonEngStyle = !changeLanguage ? backGroundYellow : backGroundBlue;
  return (
    <>
      {showTutorial && (
        <div className="grab">
          <div className="tutorial">
            <div className="version-language-wrapper">
              <div className="changeLanguage">
                <RegularButton
                  onClick={() => dispatch(setChangeLanguage(true))}
                  style={buttonUkrStyle}
                >
                  Eng
                </RegularButton>
                <RegularButton
                  onClick={() => dispatch(setChangeLanguage(false))}
                  style={buttonEngStyle}
                >
                  Ukr
                </RegularButton>
              </div>
            </div>
            {!changeLanguage ? (
              <>
                <div className="text-wrapper">{text}</div>
                <div className="item-wrapper">
                  <RegularButton
                    type="button"
                    onClick={() => setShowTutorial(false)}
                    $color="#0057b8"
                    $background="#ffd700"
                  >
                    Далі
                  </RegularButton>
                </div>
                <div className="item-wrapper switch">
                  <label htmlFor="">Закрити і ніколи не показувати</label>
                  <Switch
                    onChange={() => setConfirmReapeat(!confirmRepeat)}
                    checked={confirmRepeat}
                  ></Switch>
                </div>
                {confirmRepeat && (
                  <ConfirmField
                    onClick={() => dispatch(setisShowedTutorial(true))}
                    setOpenConfirmWindow={setConfirmReapeat}
                  />
                )}
              </>
            ) : (
              <>
                <div className="text-wrapper">{text}</div>
                <div className="item-wrapper">
                  <RegularButton
                    type="button"
                    onClick={() => setShowTutorial(false)}
                    $color="#0057b8"
                    $background="#ffd700"
                  >
                    Next
                  </RegularButton>
                </div>
                <div className="item-wrapper switch">
                  <label htmlFor="">Close and never show it again</label>
                  <Switch
                    onChange={() => setConfirmReapeat(!confirmRepeat)}
                    checked={confirmRepeat}
                  ></Switch>
                </div>
                {confirmRepeat && (
                  <ConfirmField
                    onClick={() => dispatch(setisShowedTutorial(true))}
                    setOpenConfirmWindow={setConfirmReapeat}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
