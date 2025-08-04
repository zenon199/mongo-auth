# 🌟 Project Starter with MongoDB + Auth

A production-ready, reusable authentication structure built with **Express**, **MongoDB**, **JWT**, and **Email Verification**.

Perfect for kickstarting your projects with built-in:

- 🔐 Auth (Register/Login/Logout)
- 📩 Email Verification (via Mailtrap)
- 🔁 Refresh Token & Cookie Handling
- 🔑 Password Reset
- 🧪 Zod-based Validation
- ⚙️ MongoDB integration using Mongoose

---

## 🚀 Getting Started

```bash
pnpm add project-starter-with-mongodb

📦 File Structure

📦 project-root/
├── dist/                    # Compiled JS (output)
├── src/
│   ├── controllers/         # Auth logic (register, login, verify, etc.)
│   ├── models/              # Mongoose User schema
│   ├── routes/              # Express router
│   ├── utils/               # Helper (sendMail, JWT utils)
│   ├── middlewares/         # Auth checks, error handlers
│   └── index.ts             # Entry point
├── .env                     # Environment variables
├── package.json
└── README.md

⚙️ .env Configuration
Create a .env file in your root:

DATABASE_URL=your_mongo_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_jwt_secret
BASE_URL=http://localhost:3000

MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=your_mailtrap_username
MAILTRAP_PASSWORD=your_mailtrap_password
EMAIL_SECURE=false

🛠️ Tech Stack
Node.js / Express

MongoDB / Mongoose

JWT / Cookies

Zod (validation)

Nodemailer (Mailtrap)

TypeScript

🙌 Contribution
Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

📄 License
ISC

Created with ❤️ by Zenon