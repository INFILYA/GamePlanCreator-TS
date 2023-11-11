import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectChangeLanguage, setChangeLanguage } from "./states/slices/changeLanguageSlice";
import { Switch } from "antd";
import { setisShowedTutorial } from "./states/slices/isShowedTutorialSlice";
import { useAppDispatch } from "./states/store";
import { backGroundBlue, backGroundYellow, getFromLocalStorage } from "./utilities/functions";
import { selectUserVersion } from "./states/slices/userVersionSlice";
import { RegularButton } from "./css/Button.styled";

type TTutorial = { text: React.ReactNode; key: number };

export function Tutorial(props: TTutorial) {
  const { text } = props;
  const dispatch = useAppDispatch();
  const changeLanguage = useSelector(selectChangeLanguage);
  const userVersion = useSelector(selectUserVersion);
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
              <div className="userVersion">data version: {userVersion}</div>
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
                  <div className="hideBackground">
                    <div className="confirmationForExit">
                      <div className="confirmation-wrapper">
                        <h2>Ви впевнені?</h2>
                        <RegularButton
                          type="button"
                          onClick={() => dispatch(setisShowedTutorial(true))}
                          $color="#0057b8"
                          $background="#ffd700"
                        >
                          Так
                        </RegularButton>
                        <RegularButton
                          type="button"
                          onClick={() => setConfirmReapeat(!confirmRepeat)}
                          $color="#0057b8"
                          $background="#ffd700"
                        >
                          Ні
                        </RegularButton>
                      </div>
                    </div>
                  </div>
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
                  <div className="hideBackground">
                    <div className="confirmationForExit">
                      <div className="confirmation-wrapper">
                        <h2>Are you sure?</h2>
                        <RegularButton
                          type="button"
                          onClick={() => dispatch(setisShowedTutorial(true))}
                          $color="#0057b8"
                          $background="#ffd700"
                        >
                          Yes
                        </RegularButton>
                        <RegularButton
                          type="button"
                          onClick={() => setConfirmReapeat(!confirmRepeat)}
                          $color="#0057b8"
                          $background="#ffd700"
                        >
                          No
                        </RegularButton>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
