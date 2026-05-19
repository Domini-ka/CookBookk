/**
 * AuthForm.jsx
 * Formularz logowania / rejestracji — przełączany zakładkami.
 * Brak stylów, czysty HTML + React.
 *
 * Props:
 *   onLogin    {fn} – callback(username, password)
 *   onRegister {fn} – callback(username, password)
 *   loading    {bool}
 *   error      {string|null}
 */

import { useState } from "react";

const EMPTY = { username: "", password: "", confirm: "" };

export function AuthForm({ onLogin, onRegister, loading, error }) {
  const [mode, setMode]     = useState("login"); // "login" | "register"
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const isRegister = mode === "register";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (form.username.trim().length < 3)
      e.username = "Min. 3 znaki.";
    if (form.password.length < 6)
      e.password = "Min. 6 znaków.";
    if (isRegister && form.password !== form.confirm)
      e.confirm = "Hasła się nie zgadzają.";
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      if (isRegister) {
        await onRegister(form.username.trim(), form.password);
      } else {
        await onLogin(form.username.trim(), form.password);
      }
    } catch {
      // error jest już ustawiony przez hook — nie robimy nic extra
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setForm(EMPTY);
    setErrors({});
  };

  return (
    <div>
      <h1>🍳 CookBook</h1>

      <div>
        <button
          onClick={() => switchMode("login")}
          disabled={mode === "login"}
        >
          Logowanie
        </button>
        {" "}
        <button
          onClick={() => switchMode("register")}
          disabled={mode === "register"}
        >
          Rejestracja
        </button>
      </div>

      <h2>{isRegister ? "Utwórz konto" : "Zaloguj się"}</h2>

      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <div>
          <label htmlFor="username">Nazwa użytkownika</label>
          <br />
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="min. 3 znaki"
            autoComplete="off"
          />
          {errors.username && <span style={{ color: "red" }}> {errors.username}</span>}
        </div>

        <div>
          <label htmlFor="password">Hasło</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="min. 6 znaków"
            autoComplete="off"
          />
          {errors.password && <span style={{ color: "red" }}> {errors.password}</span>}
        </div>

        {isRegister && (
          <div>
            <label htmlFor="confirm">Powtórz hasło</label>
            <br />
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.confirm && <span style={{ color: "red" }}> {errors.confirm}</span>}
          </div>
        )}

        {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

        <br />
        <button type="submit" disabled={loading}>
          {loading
            ? "Proszę czekać..."
            : isRegister
            ? "Zarejestruj się"
            : "Zaloguj się"}
        </button>
      </form>
    </div>
  );
}