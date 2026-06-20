# 💰 Personal Expense Tracker with Budget Management

A full-stack web application to track daily expenses, organize spending by category, set monthly & category-wise budgets, and visualize spending patterns — now with **AI-powered receipt scanning** that auto-fills the expense form from a photo of your receipt.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Passport.js](https://img.shields.io/badge/Auth-Passport.js-34E27A?logo=passport&logoColor=white)
![Gemini API](https://img.shields.io/badge/AI-Gemini%20Vision%20API-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshot](#-screenshot)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema-overview)
- [Testing](#-testing)
- [Known Limitations](#-known-limitations)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## ✨ Features

- 🔐 **User Authentication** — Register, Login, Logout (Passport.js, hashed passwords)
- 💸 **Expense Management** — Full CRUD on transactions
- 🗂️ **Category Organization** — 7 built-in categories (Food, Travel, Shopping, Bills, Entertainment, Education, Other)
- 📅 **Monthly Budget** — Set an overall spending limit per month
- 🎯 **Category Budgets** — Set individual budgets per category with status indicators (`good` / `warning` / `over` / `unset`)
- 📊 **Dashboard** — Pie-chart visualization of spending distribution (Chartkick.js)
- 🔍 **Transaction Filtering** — Filter by category, date range, or search text
- 🤖 **AI Receipt Scanning (New)** — Upload a receipt photo, click **Auto Fill**, and the expense form is pre-filled using the **Gemini Vision API** (amount, date, category, merchant, description, confidence score) — with a mandatory user review step before saving

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js |
| Web Framework | Express.js 4.x |
| Database | MongoDB + Mongoose ODM |
| Authentication | Passport.js (Local Strategy) |
| Template Engine | EJS + ejs-mate |
| Charts | Chartkick.js |
| Sessions | express-session |
| Flash Messages | connect-flash |
| File Uploads | Multer |
| Receipt AI Extraction | Google Gemini Vision API |

---

## 📸 Screenshot

**AI Receipt Scan — Add Expense Page**

![Scan Receipt UI](screenshots/scan-receipt-autofill.png)

> Upload a receipt → click **Auto Fill** → AI detects amount, date, category, and merchant details → review → save.

---

## 🏗 Project Architecture

The app follows the **MVC (Model-View-Controller)** pattern:

```
Browser (EJS Views) ⇄ Express Routes ⇄ Controllers ⇄ Mongoose Models ⇄ MongoDB
                                              │
                                              └── Gemini Vision API (receipt extraction)
```

Full architecture diagrams, DFDs (Level 0/1/2), ERD, and sequence flows are documented in `/docs`.

---

## 📁 Folder Structure

```
MAJORPROJECT2/
├── controllers/            # Business logic
│   ├── dashboard.js
│   ├── transactions.js
│   └── user.js
├── init/                   # Database initialization
│   ├── data.js
│   └── index.js
├── middleware/              # Custom middleware
│   ├── upload.js
│   └── receiptUpload.js     # Multer config for receipt images
├── models/                  # Mongoose schemas
│   ├── budget.js
│   ├── categoryBudget.js
│   ├── transactions.js
│   └── user.js
├── public/                  # Static assets
│   ├── css/
│   ├── js/
│   └── uploads/receipts/    # Uploaded receipt images (gitignored)
├── routes/                  # Express routes
│   ├── dashboard.js
│   ├── transactions.js
│   └── user.js
├── utils/                   # Helper functions
│   ├── categories.js
│   ├── wrapAsync.js
│   └── geminiReceiptExtractor.js   # Gemini Vision API integration
├── views/                   # EJS templates
│   ├── dashboard/
│   ├── includes/
│   ├── layouts/
│   ├── transactions/
│   └── user/
├── .env                     # Environment variables (not committed)
├── .env.example
├── .gitignore
├── package.json
└── server.js                # Entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- A Google AI Studio API key (for Gemini Vision)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, Cloudinary, and Gemini credentials

# 4. Start MongoDB (if running locally)
mongod

# 5. Run the application
npm run dev      # development mode
npm start         # production mode
```

App will be available at **http://localhost:5000**

---

## 🔑 Environment Variables

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-3.5-flash
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Home page | No |
| GET / POST | `/register` | Show / submit registration form | No |
| GET / POST | `/login` | Show / submit login form | No |
| GET | `/logout` | Logout user | Yes |
| GET | `/dashboard` | Main dashboard view | Yes |
| POST | `/dashboard/budget` | Set/update monthly budget | Yes |
| POST | `/dashboard/category-budgets` | Set/update category budgets | Yes |
| GET | `/transactions` | List all transactions (filterable) | Yes |
| GET / POST | `/transactions/new` | Show / submit new expense form | Yes |
| **POST** | **`/transactions/receipt`** | **Upload receipt → AI auto-fill (Gemini)** | **Yes** |
| GET | `/transactions/:id` | View single transaction | Yes |
| GET / PUT | `/transactions/:id/edit` | Show / submit edit form | Yes |
| DELETE | `/transactions/:id` | Delete transaction | Yes |

---

## 🗄 Database Schema Overview

**User** → owns many **Transactions**, sets one **Budget** (per month), defines many **CategoryBudget** entries.

| Field | Type | Notes |
|---|---|---|
| `amount` | Number | > 0 |
| `description` | String | min 1 char |
| `category` | String | enum of 7 values |
| `date` | Date | optional, ISO |
| `receipt` | Object | uploaded image URL + AI-extracted metadata (optional) |

---

## ✅ Testing

Manual functional (end-to-end) testing covering:
- Auth flows (register/login/logout, wrong password)
- Expense CRUD + validation
- Budget set/update + status calculation (`good`/`warning`/`over`/`unset`)
- Filters (category, date range, search)
- Authorization checks (can't access/delete another user's data)
- Receipt scanning (valid/invalid file types, low-confidence extraction, oversized files)

See `/docs` for the full test case matrix.

---

## ⚠️ Known Limitations

- Single-user only (no multi-user/family sharing)
- No automatic bank feed integration — expenses are still manually entered or AI-assisted via receipt upload
- No recurring expense automation
- No CSV/PDF export yet
- Indian Rupee (₹) only — no multi-currency support
- Not optimized for mobile devices
- AI extraction accuracy depends on receipt image quality

---

## 🗺 Roadmap

- [x] AI Receipt Scanning (Gemini Vision API) auto-fill
- [ ] Recurring expenses
- [ ] CSV / PDF export
- [ ] Email budget alerts & reports
- [ ] Multi-currency support
- [ ] Mobile-responsive REST API
- [ ] Social login (Google/Facebook)
- [ ] Batch receipt upload

---

## 👤 Author

**Pandit Divyanshu Shukla**

---

## 📄 License

This project is licensed under the MIT License.
