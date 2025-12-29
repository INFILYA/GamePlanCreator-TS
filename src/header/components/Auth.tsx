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
            await signInWithEmailLink(
              auth,
              localStorage.getItem("userEmail")!,
              window.location.href
            );
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
      setLoginError("");
      
      // Определяем URL в зависимости от окружения
      const isLocalhost = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('localhost');
      
      const actionCodeSettings: any = {
        url: isLocalhost 
          ? `${window.location.origin}/Auth`
          : "https://gameplancreator-ts.web.app/Auth",
        handleCodeInApp: true,
      };
      
      // Добавляем dynamicLinkDomain только для продакшена
      if (!isLocalhost) {
        actionCodeSettings.dynamicLinkDomain = "gameplancreatorts.page.link";
      }
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem("userEmail", email);
      alert("We have sent you link on email");
      setLoginError("");
    } catch (err: any) {
      console.error(err);
      // Правильно извлекаем сообщение об ошибке
      const errorMessage = err?.message || err?.code || String(err) || "An error occurred. Please try again.";
      setLoginError(errorMessage);
    } finally {
      setIsLoginLoading(false);
    }
  }
  async function signInWithGoogle() {
    try {
      setLoginError("");
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.code || "Failed to sign in with Google. Please try again.";
      setLoginError(errorMessage);
    }
  }
  async function signInWithFaceBook() {
    try {
      setLoginError("");
      await signInWithPopup(auth, facebookProvider);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.code || "Failed to sign in with Facebook. Please try again.";
      setLoginError(errorMessage);
      alert("Sorry, account with this name already existed. Please, try again");
    }
  }
  return (
    <SectionWrapper>
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
          {loginError && (
            <div style={{ color: 'red', marginTop: '10px', padding: '10px' }}>
              Error: {loginError}
            </div>
          )}
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
    </SectionWrapper>
  );
}
