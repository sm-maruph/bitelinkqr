import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Utensils } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import TrialSetupPage from "./TrialSetupPage";

const Field = ({ label, ...props }) => (
  <label className="auth-field">
    <span>{label}</span>
    <input required {...props} />
  </label>
);
const SelectField = ({ label, children, ...props }) => (
  <label className="auth-field">
    <span>{label}</span>
    <select {...props}>{children}</select>
  </label>
);

export function LoginPage() {
  const auth = useAuth(),
    navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await auth.login(form);
      navigate("/admin");
    } catch (err) {
      setError(
        err.status === 401
          ? "Email or password is incorrect."
          : "Login failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      title="Welcome back"
      text="Log in with the credentials you created for your restaurant."
    >
      <form onSubmit={submit}>
        <Field
          label="Email / username"
          type="text"
          autoComplete="username"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          minLength="8"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
        />
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button className="saas-button" disabled={busy}>
          {busy ? "Logging in…" : "Log in"} <ArrowRight size={15} />
        </button>
      </form>
      <p>
        New to BiteLink? <Link to="/register">Start a free trial</Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  return <TrialSetupPage />;
}

function AuthShell({ title, text, children }) {
  return (
    <main className="auth-page">
      <Link className="saas-brand" to="/">
        <Utensils size={19} /> Bite<span>Link</span>
      </Link>
      <section className="auth-card">
        <span className="saas-kicker">BiteLink account</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {children}
      </section>
    </main>
  );
}
