import loginBackground from "@/assets/auth/login/login-background.png";
import { LoginForm, LoginIllustration } from "./components";
import "./login.css";

/** OpenEvent 登录页，桌面端按 1920 × 1080 Figma 稿还原。 */
export default function LoginPage() {
  return (
    <main className="openevent-login-page">
      <img
        src={loginBackground}
        alt=""
        aria-hidden="true"
        className="openevent-login-background"
      />
      <LoginIllustration />
      <section className="openevent-login-panel" aria-label="登录">
        <LoginForm />
      </section>
    </main>
  );
}
