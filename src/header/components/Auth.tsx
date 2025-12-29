import { auth, facebookProvider, googleProvider } from "../../config/firebase";
import {
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { FormEvent, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { RegularButton } from "../../css/Button.styled";

export function Auth() {
  const navigate = useNavigate();
  const [isRegistratedUser] = useAuthState(auth);
  const [email, setEmail] = useState<string>("");
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  // Обрабатываем результат редиректа после авторизации через Google/Facebook
  useEffect(() => {
    async function handleRedirectResult() {
      try {
        // Проверяем, есть ли результат редиректа
        const result = await getRedirectResult(auth);

        if (result) {
          console.log("Auth: Redirect sign-in successful!", result.user.email);

          // Удаляем флаг pending redirect
          localStorage.removeItem("pendingAuthRedirect");

          // Очищаем URL от параметров редиректа
          if (window.location.search || window.location.hash) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }

          // Перенаправляем на главную страницу
          navigate("/", { replace: true });
        }
      } catch (err: any) {
        // Игнорируем ошибки, если редиректа не было
        if (err?.code && err.code !== "auth/operation-not-allowed") {
          console.log("Auth: No redirect result or error:", err.code);
        }
      }
    }

    // Обрабатываем редирект только если есть признаки редиректа
    const pendingRedirect = localStorage.getItem("pendingAuthRedirect");
    const hasUrlParams = window.location.search || window.location.hash;

    if (pendingRedirect || hasUrlParams) {
      handleRedirectResult();
    }
  }, [navigate]);

  // Автоматически перенаправляем на главную, если пользователь залогинен
  useEffect(() => {
    if (isRegistratedUser) {
      console.log("User is logged in, redirecting to home");
      navigate("/", { replace: true });
    }
  }, [isRegistratedUser, navigate]);

  useEffect(() => {
    // Обработка email link авторизации (только если не было редиректа)
    async function handleEmailLink() {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        console.log("Email link detected, signing in...");
        try {
          await signInWithEmailLink(
            auth,
            localStorage.getItem("userEmail")!,
            window.location.href
          );
          localStorage.removeItem("userEmail");
          console.log("Email link sign-in successful");
          navigate("/", { replace: true });
        } catch (emailError) {
          console.error("Email link sign-in error:", emailError);
        }
      }
    }

    // Проверяем email link только если пользователь не залогинен
    if (!isRegistratedUser) {
      handleEmailLink();
    }
  }, [isRegistratedUser, navigate]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoginLoading(true);
      setLoginError("");

      // Определяем URL в зависимости от окружения
      const hostname = window.location.hostname;
      const isLocalhost =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.includes("localhost") ||
        hostname.includes("127.0.0.1");

      console.log("Current hostname:", hostname);
      console.log("Is localhost:", isLocalhost);

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

      console.log("Action code settings:", actionCodeSettings);

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem("userEmail", email);
      alert("We have sent you link on email");
      setLoginError("");
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);
      // Правильно извлекаем сообщение об ошибке
      const errorMessage =
        err?.message ||
        err?.code ||
        String(err) ||
        "An error occurred. Please try again.";
      setLoginError(errorMessage);
      alert(`Login error: ${errorMessage}`);
    } finally {
      setIsLoginLoading(false);
    }
  }
  async function signInWithGoogle() {
    try {
      setLoginError("");
      console.log("Starting Google sign-in from:", window.location.href);

      // Сначала пробуем popup (работает в Chrome и если не заблокирован)
      try {
        console.log("Trying popup first...");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Popup sign-in successful:", result.user.email);
        navigate("/", { replace: true });
        return;
      } catch (popupError: any) {
        console.log(
          "Popup failed, error code:",
          popupError?.code,
          "message:",
          popupError?.message
        );

        // Если popup заблокирован или закрыт, используем redirect
        if (
          popupError?.code === "auth/popup-blocked" ||
          popupError?.code === "auth/popup-closed-by-user" ||
          popupError?.code === "auth/cancelled-popup-request"
        ) {
          console.log("Popup blocked/closed, switching to redirect...");
          localStorage.setItem("pendingAuthRedirect", "google");
          await signInWithRedirect(auth, googleProvider);
          // Редирект произойдет, страница перезагрузится
          return;
        }

        // Если другая ошибка (например, auth/account-exists-with-different-credential), пробрасываем её дальше
        throw popupError;
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      localStorage.removeItem("pendingAuthRedirect");
      const errorMessage =
        err?.message ||
        err?.code ||
        "Failed to sign in with Google. Please try again.";
      setLoginError(errorMessage);
    }
  }
  async function signInWithFaceBook() {
    try {
      setLoginError("");
      console.log("🔵 Auth: signInWithFaceBook() called");
      console.log("🔵 Auth: Current URL:", window.location.href);
      console.log("🔵 Auth: Current pathname:", window.location.pathname);
      
      // Всегда используем redirect (popup не работает в IDE)
      console.log("🔵 Auth: Using redirect for Facebook sign-in");
      console.log("🔵 Auth: Setting pendingAuthRedirect = 'facebook' in localStorage");
      localStorage.setItem("pendingAuthRedirect", "facebook");
      console.log("🔵 Auth: localStorage.pendingAuthRedirect =", localStorage.getItem("pendingAuthRedirect"));
      
      console.log("🔵 Auth: Calling signInWithRedirect(auth, facebookProvider)...");
      await signInWithRedirect(auth, facebookProvider);
      console.log("🔵 Auth: signInWithRedirect() completed - redirect should happen now");
      // Редирект произойдет, страница перезагрузится
    } catch (err: any) {
      console.error("❌ Auth: Facebook sign-in error:", err);
      console.error("❌ Auth: Error code:", err?.code);
      console.error("❌ Auth: Error message:", err?.message);
      localStorage.removeItem("pendingAuthRedirect");
      const errorMessage =
        err?.message ||
        err?.code ||
        "Failed to sign in with Facebook. Please try again.";
      setLoginError(errorMessage);
      if (
        err?.code &&
        err.code !== "auth/popup-blocked" &&
        err.code !== "auth/popup-closed-by-user"
      ) {
        alert("Sorry, account with this name already existed. Please, try again");
      } else {
        alert(`Login error: ${errorMessage}`);
      }
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
            <div style={{ color: "red", marginTop: "10px", padding: "10px" }}>
              Error: {loginError}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button type="button" className="google" onClick={signInWithGoogle}>
              <img src="/photos/google.jpg" alt="" />
            </button>
            <button
              type="button"
              className="facebook"
              onClick={signInWithFaceBook}
            >
              <img src="/photos/facebook.jpg" alt="" />
            </button>
          </div>
        </div>
      </form>
    </SectionWrapper>
  );
}
