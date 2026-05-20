# CookBookk# 🍳 CookBook — Aplikacja do zarządzania przepisami kulinarnymi

Nowoczesna aplikacja webowa typu **CookBook** umożliwiająca zarządzanie przepisami kulinarnymi z obsługą działania offline, synchronizacją danych oraz autoryzacją użytkownika.

Projekt został wykonany w technologii React + Vite na frontendzie oraz Node.js + Express na backendzie.

---

# ✨ Główne funkcjonalności

- 📖 Dodawanie przepisów
- 📝 Edycja przepisów
- ❌ Usuwanie przepisów
- 🖼️ Zdjęcia potraw
- 🥘 Lista składników wraz z proporcjami
- 📋 Kroki przygotowania
- ⏱️ Czas wykonania
- 🔥 Poziom trudności
- 🌐 Synchronizacja offline/online
- 💾 Zapisywanie danych lokalnie
- 🔐 Autoryzacja JWT
- 📱 Responsywny interfejs użytkownika
- 🎨 Nowoczesny UI oparty o Tailwind CSS

---

# 🛠️ Technologie użyte w projekcie

## Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios / Fetch API

## Backend
- Node.js
- Express
- JWT Authentication
- CORS
- dotenv

## Offline & Synchronizacja
- localStorage
- navigator.onLine
- Synchronizacja danych po odzyskaniu internetu

---

# 📂 Struktura projektu

```text
CookBook/
│
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── server.js
│   └── .env
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md