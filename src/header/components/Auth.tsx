import { auth, facebookProvider, googleProvider } from "../../config/firebase";
import {
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { FormEvent, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLocation, useNavigate } from "react-router";
import { getFromLocalStorage } from "../../utilities/functions";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { RegularButton } from "../../css/Button.styled";

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;
  const [isRegistratedUser] = useAuthState(auth);
  const [email, setEmail] = useState<string>("");
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  useEffect(() => {
    async function signInWithEmail() {
      try {
        if (isRegistratedUser) {
          navigate("/");
        } else {
          if (isSignInWithEmailLink(auth, window.location.href)) {
            console.log(getFromLocalStorage("userEmail"));
            await signInWithEmailLink(auth, getFromLocalStorage("userEmail"), window.location.href);
            localStorage.removeItem("userEmail");
          }
        }
      } catch (err) {
        console.log(err);
        navigate("/Auth");
      }
    }
    signInWithEmail();
  }, [isRegistratedUser, navigate, search]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoginLoading(true);
      await sendSignInLinkToEmail(auth, email, {
        url: "https://gameplancreator-ts.web.app/Auth",
        handleCodeInApp: true,
        dynamicLinkDomain: "gameplancreatorts.page.link",
      });
      localStorage.setItem("userEmail", email);
      alert("We have sent you link on email");
      setLoginError("");
    } catch (err) {
      console.error(err);
      setLoginError(err as string);
    } finally {
      setIsLoginLoading(false);
    }
  }
  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }
  async function signInWithFaceBook() {
    try {
      await signInWithPopup(auth, facebookProvider);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Sorry , account with this name already existed. Please , try again");
    }
  }
  return (
    <SectionWrapper
      content={
        <form className="emailPanel" onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="text"
              placeholder="Email..."
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <RegularButton
              type="submit"
              $color="#ffd700"
              $background="#0057b8"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? "Logging you in" : "Log in"}
            </RegularButton>
            <div>{loginError}</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" className="google" onClick={signInWithGoogle}>
                <img src="/photos/google.jpg" alt="" />
              </button>
              <button type="button" className="facebook" onClick={signInWithFaceBook}>
                <img src="/photos/facebook.jpg" alt="" />
              </button>
            </div>
          </div>
        </form>
      }
    />
  );
}
