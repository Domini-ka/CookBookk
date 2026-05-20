import { useState } from "react";

const EMPTY = { username: "", password: "", confirm: "" };

const inputCls = (err) =>
  `w-full bg-white border-2 rounded-2xl px-4 py-3 text-cocoa-700 placeholder-sand-300
   outline-none transition-all duration-200 text-sm font-medium
   focus:ring-0 focus:border-rose-300
   ${err ? "border-red-300 bg-red-50" : "border-vanilla-200 hover:border-rose-200"}`;

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

  return (
    <div className="min-h-screen bg-vanilla-50 flex items-center justify-center p-4"
         style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fde8ec55 0%, transparent 50%), radial-gradient(circle at 80% 80%, #d9f5ec55 0%, transparent 50%), radial-gradient(circle at 60% 10%, #dff0fb55 0%, transparent 40%)" }}>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-soft">
            🍳
          </div>
          <h1 className="font-display text-4xl text-cocoa-700">CookBook</h1>
          <p className="text-sand-400 text-sm mt-1.5">Gotuj z radością 🌸</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-card border border-vanilla-200">
          {/* Tabs */}
          <div className="flex gap-1 bg-vanilla-100 rounded-2xl p-1 mb-7">
            {["login","register"].map((m) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                  ${mode === m ? "bg-white text-cocoa-700 shadow-soft" : "text-sand-400 hover:text-sand-500"}`}>
                {m === "login" ? "Logowanie" : "Rejestracja"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-sand-400 uppercase tracking-widest mb-1.5">
                Nazwa użytkownika
              </label>
              <input id="username" name="username" value={form.username}
                onChange={handleChange} placeholder="min. 3 znaki" autoComplete="off"
                className={inputCls(errors.username)} />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-sand-400 uppercase tracking-widest mb-1.5">
                Hasło
              </label>
              <input id="password" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="min. 6 znaków" autoComplete="off"
                className={inputCls(errors.password)} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-sand-400 uppercase tracking-widest mb-1.5">
                  Powtórz hasło
                </label>
                <input id="confirm" name="confirm" type="password" value={form.confirm}
                  onChange={handleChange} autoComplete="off"
                  className={inputCls(errors.confirm)} />
                {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-rose-300 hover:bg-rose-400 active:bg-rose-400
                         text-white font-bold py-3.5 rounded-2xl mt-2
                         transition-all duration-200 shadow-soft hover:shadow-card
                         disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {loading ? "Chwileczka…" : isRegister ? "Utwórz konto ✨" : "Zaloguj się 🌸"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}