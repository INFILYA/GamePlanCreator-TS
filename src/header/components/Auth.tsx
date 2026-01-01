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
          // Игнорируем ошибки
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
      navigate("/", { replace: true });
    }
  }, [isRegistratedUser, navigate]);

  useEffect(() => {
    // Обработка email link авторизации (только если не было редиректа)
    async function handleEmailLink() {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          await signInWithEmailLink(
            auth,
            localStorage.getItem("userEmail")!,
            window.location.href
          );
          localStorage.removeItem("userEmail");
          navigate("/", { replace: true });
        } catch (emailError) {
          // Обработка ошибок
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

      // Сначала пробуем popup (работает в Chrome и если не заблокирован)
      try {
        const result = await signInWithPopup(auth, googleProvider);
        navigate("/", { replace: true });
        return;
      } catch (popupError: any) {
        // Если popup заблокирован или закрыт, используем redirect
        if (
          popupError?.code === "auth/popup-blocked" ||
          popupError?.code === "auth/popup-closed-by-user" ||
          popupError?.code === "auth/cancelled-popup-request"
        ) {
          localStorage.setItem("pendingAuthRedirect", "google");
          await signInWithRedirect(auth, googleProvider);
          // Редирект произойдет, страница перезагрузится
          return;
        }

        // Если другая ошибка (например, auth/account-exists-with-different-credential), пробрасываем её дальше
        throw popupError;
      }
    } catch (err: any) {
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

      // Всегда используем redirect (popup не работает в IDE)
      localStorage.setItem("pendingAuthRedirect", "facebook");
      await signInWithRedirect(auth, facebookProvider);
      // Редирект произойдет, страница перезагрузится
    } catch (err: any) {
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
        alert(
          "Sorry, account with this name already existed. Please, try again"
        );
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
