import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { setInfoOfPlayer } from "../states/slices/playerInfoSlice";
import { SetDate } from "../utilities/SetDate";
import { selectHomeTeam } from "../states/slices/homeTeamSlice";
import { selectGuestTeam } from "../states/slices/guestTeamSlice";
import { RegularButton } from "../css/Button.styled";

export function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isRegistratedUser] = useAuthState(auth);
  const homeTeam = useSelector(selectHomeTeam);
  const guestTeam = useSelector(selectGuestTeam);

  function openAuthWindow() {
    navigate("/Auth");
  }
  async function logout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  }
  const guestLength = guestTeam.length !== 0;
  const homeLength = homeTeam.length !== 0;
  return (
    <header className="header">
      <div className="block">
        <NavLink to={"/"} onClick={() => dispatch(setInfoOfPlayer(null))}>
          <img src="/photos/home.jpg" alt="" style={{ borderRadius: 0 }} />
        </NavLink>
        {isRegistratedUser?.photoURL && (
          <img src={isRegistratedUser.photoURL} alt="" />
        )}
        <h2>{isRegistratedUser?.displayName || isRegistratedUser?.email || "Guest"}</h2>
      </div>
      {(guestLength || homeLength) && (
        <div className="matchup">
          {guestLength && <img src={guestTeam[0].logo} alt=""></img>}
          vs
          {homeLength && <img src={homeTeam[0].logo} alt=""></img>}
        </div>
      )}
      {isRegistratedUser ? (
        <div className="block" style={{ justifyContent: "end" }}>
          <SetDate />
          <RegularButton type="button" onClick={logout} $color="orangered" $background="black">
            Log out
          </RegularButton>
        </div>
      ) : (
        <div className="block" style={{ justifyContent: "end" }}>
          <SetDate />
          <RegularButton
            type="button"
            onClick={openAuthWindow}
            $color="#ffd700"
            $background="#0057b8"
          >
            Log in
          </RegularButton>
        </div>
      )}
    </header>
  );
}
