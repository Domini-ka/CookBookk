/**
 * components/AuthForm.jsx
 * Logika bez zmian. Tylko UI / klasy Tailwind.
 */

import { useState } from "react";

const EMPTY = { username: "", password: "", confirm: "" };

export function AuthForm({ onLogin, onRegister, loading, error }) {
  const [mode, setMode]     = useState("login");
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
    if (form.username.trim().length < 3) e.username = "Min. 3 znaki.";
    if (form.password.length < 6)        e.password = "Min. 6 znaków.";
    if (isRegister && form.password !== form.confirm) e.confirm = "Hasła się nie zgadzają.";
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      if (isRegister) await onRegister(form.username.trim(), form.password);
      else            await onLogin(form.username.trim(), form.password);
    } catch {}
  };

  const switchMode = (m) => { setMode(m); setForm(EMPTY); setErrors({}); };

  const inputCls = (hasErr) =>
    `w-full bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 placeholder-ink-400
     outline-none transition-all duration-200
     focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60
     ${hasErr ? "border-red-500/60" : "border-ink-600 hover:border-ink-400"}`;

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e1b19_0%,_#0f0f0f_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🍳</div>
          <h1 className="font-display text-4xl text-ink-50 tracking-tight">CookBook</h1>
          <p className="text-ink-400 text-sm mt-2 font-light">Twoje przepisy, zawsze pod ręką</p>
        </div>

        {/* Card */}
        <div className="bg-ink-800/80 backdrop-blur border border-ink-700/50 rounded-2xl p-8 shadow-card">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-ink-900/60 rounded-xl p-1 mb-8">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                  ${mode === m
                    ? "bg-amber-400 text-ink-900 shadow-sm"
                    : "text-ink-400 hover:text-ink-200"}`}
              >
                {m === "login" ? "Logowanie" : "Rejestracja"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                Nazwa użytkownika
              </label>
              <input
                id="username" name="username" value={form.username}
                onChange={handleChange} placeholder="min. 3 znaki"
                autoComplete="off"
                className={inputCls(errors.username)}
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1.5">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                Hasło
              </label>
              <input
                id="password" name="password" type="password"
                value={form.password} onChange={handleChange}
                placeholder="min. 6 znaków" autoComplete="off"
                className={inputCls(errors.password)}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm (register only) */}
            {isRegister && (
              <div>
                <label htmlFor="confirm" className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                  Powtórz hasło
                </label>
                <input
                  id="confirm" name="confirm" type="password"
                  value={form.confirm} onChange={handleChange}
                  autoComplete="off"
                  className={inputCls(errors.confirm)}
                />
                {errors.confirm && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.confirm}</p>
                )}
              </div>
            )}

            {/* Server error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600
                         text-ink-900 font-semibold py-3 px-6 rounded-xl
                         transition-all duration-200 hover:shadow-glow
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Proszę czekać…" : isRegister ? "Utwórz konto" : "Zaloguj się"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}