# 🔍 CitizenLens — AI-Verified Evidence & Breaking News Marketplace

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-emerald.svg)](https://mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

**Live demo:** [citizen-lens.vercel.app](https://citizen-lens.vercel.app) · **Repo:** [github.com/Sukumar-Manivel/citizen-lens](https://github.com/Sukumar-Manivel/citizen-lens)

> CitizenLens is a secure digital evidence marketplace connecting eyewitness citizens, CCTV/dashcam operators, and broadcast newsrooms. It automates media authentication through an AI/forensic verification pipeline, prevents content theft with DRM-protected previews, and safeguards licensed footage with invisible steganographic watermarking.

---

## 📸 Screenshots

<!--
  Add 2–4 screenshots or a short demo GIF here before submitting.
  Judges skim visuals first — this section matters more than almost
  anything else in the README for first impressions.

  ![Marketplace feed](./docs/screenshots/marketplace.png)
  ![Upload & verification flow](./docs/screenshots/upload.png)
  ![Secure media player](./docs/screenshots/player.png)
-->

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Users
        C[📱 Citizen / CCTV Operator]
        J[📺 Newsroom / Journalist]
    end

    subgraph "Frontend (React + Vite)"
        UI_Auth[Authentication UI]
        UI_Upload[Upload & Drag-and-Drop Portal]
        UI_Market[Live Marketplace Feed]
        UI_Player[Secure Media Player - DRM Protected]
        UI_Vault[License Vault & Purchases]
        UI_Dash[Citizen Dashboard & Wallet]
    end

    subgraph "Backend API (Express.js)"
        API_Auth[/api/auth]
        API_Evidence[/api/evidence]
        API_Payment[/api/payment]
        API_Download[/api/download]
        API_User[/api/user]
    end

    subgraph "Automated Agents"
        A1[Verification Agent<br/>SHA-256 + ELA + EXIF]
        A2[Watermark Agent<br/>Dynamic SVG Overlay]
        A3[Payment & Escrow Agent<br/>80/20 Revenue Split]
        A4[Steganography Agent<br/>Invisible Buyer Signature]
        A5[Freshness Agent<br/>Hourly Cron Reclassification]
        A6[Credit Points Agent<br/>Reputation & Queue Boost]
    end

    subgraph "Database & Storage"
        DB[(MongoDB Atlas Cloud)]
        FS[File Storage - Originals, Previews, Downloads]
    end

    C -->|Uploads Footage| UI_Upload
    J -->|Browses & Buys| UI_Market

    UI_Upload --> API_Evidence
    UI_Market --> API_Evidence
    UI_Player --> API_Evidence
    UI_Vault --> API_Download
    UI_Dash --> API_User

    API_Evidence --> A1
    A1 --> A2
    A1 --> A6
    API_Payment --> A3
    A3 --> A4
    A3 --> DB

    A1 --> DB
    A2 --> FS
    A4 --> FS
    A5 --> DB
```

---

## ⚙️ How It Works — The 6 Automated Agents

| Agent | Trigger | Core Responsibility |
|---|---|---|
| **1. Verification Agent** | On upload | Runs SHA-256 hashing, Error Level Analysis (ELA) for tampering detection, extracts EXIF hardware/GPS metadata, and generates a **Trust Score (0–100)**. |
| **2. Watermark Agent** | Post-verification | Applies a dynamic, semi-transparent SVG overlay to preview media to deter unlicensed use before purchase. |
| **3. Payment & Escrow Agent** | On purchase | Runs an **80/20 escrow split** (80% to the citizen's wallet, 20% platform fee) and issues a binding license certificate. |
| **4. Steganography Agent** | On license issue | Embeds an imperceptible digital signature (buyer name, email, transaction ID) into the master file, so leaks are cryptographically traceable. |
| **5. Freshness Agent** | Hourly cron | Tags content as 🔴 **Breaking** (&lt;6 hrs), 🟡 **Recent** (&lt;7 days), or 🔵 **Archival** (&gt;7 days). |
| **6. Credit Points Agent** | Dynamic events | Tracks citizen reputation (Level 1 Rookie → Level 5 Legend) and converts points into marketplace visibility boosts. |

---

## 🔒 Dual-Layer Content Protection

**Layer 1 — Browser-level DRM (pre-purchase)**
- Blocks right-click / context menu on protected media
- Detects screen-capture tools and window blur, and obscures the viewport when triggered
- Intercepts `PrintScreen`, `Ctrl+S`, and `Ctrl+P`

**Layer 2 — Invisible steganographic watermarking (post-purchase)**
- The delivered master file looks clean to the human eye
- The buyer's unique signature is embedded in the file's binary/EXIF data
- A **Forensic Proof Inspector** lets admins and newsrooms verify ownership and integrity of any file

---

## 📡 REST API Reference

**Authentication** — `/api/auth`
| Method & Path | Description |
|---|---|
| `POST /api/auth/register` | Create a citizen or journalist account |
| `POST /api/auth/login` | Authenticate and receive a JWT bearer token |
| `GET /api/auth/me` | Retrieve the authenticated user's profile |

**Evidence Feed** — `/api/evidence`
| Method & Path | Description |
|---|---|
| `POST /api/evidence` | Multipart upload + automated verification pipeline |
| `GET /api/evidence` | Public feed with search, media type, and trust score filters |
| `GET /api/evidence/:id` | Full evidence detail and forensic authenticity ledger |
| `GET /api/evidence/my` | Uploads made by the logged-in citizen |

**Licensing & Escrow** — `/api/payment`
| Method & Path | Description |
|---|---|
| `POST /api/payment/checkout` | Execute a license purchase and trigger watermark embedding |
| `GET /api/payment/my-purchases` | Retrieve acquired licenses and master files |
| `GET /api/payment/license/:id` | View an official license certificate |

**Master Delivery** — `/api/download`
| Method & Path | Description |
|---|---|
| `GET /api/download/:purchaseId` | Stream the high-resolution master file (authorized buyer only) |

**User Ledger & Gamification** — `/api/user`
| Method & Path | Description |
|---|---|
| `GET /api/user/wallet` | Available balance and lifetime earnings |
| `POST /api/user/withdraw` | Withdraw escrow funds via IMPS/NEFT |
| `GET /api/user/credits` | Reputation points, rank, and queue boost metrics |
| `GET /api/user/leaderboard` | Community rankings of top verified reporters |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT |
| Deployment | Vercel (frontend), Railway/Render (backend) |

---

## 💻 Quickstart (Local Development)

### 1. Prerequisites
- Node.js v18 or higher
- A MongoDB Atlas connection string

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env   # fill in your MongoDB URI, JWT secret, etc.
npm start
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🚀 Deployment

1. **Database** — Deploy a free M0 cluster on [MongoDB Atlas](https://mongodb.com/atlas); whitelist `0.0.0.0/0` for hosted environments.
2. **Backend** — Deploy `server/` to [Railway](https://railway.app) or [Render](https://render.com) using the variables from `.env.example`.
3. **Frontend** — Connect `client/` to [Vercel](https://vercel.com) (SPA rewrites are pre-configured in `vercel.json`).

> **Note:** Free-tier backend hosts (Render/Railway) can spin down when idle and take 30–60s to wake on the first request. If the live demo feels slow on first load, that's why — give it a moment.

---

## 🗺️ Roadmap / Known Limitations

- [ ] Mobile-responsive polish for the upload and player views
- [ ] Automated test coverage for the verification and payment pipelines
- [ ] Rate limiting and abuse protection on public endpoints
- [ ] Multi-currency payout support beyond IMPS/NEFT

Being upfront about what's unfinished is intentional — this section exists so reviewers know what's a deliberate scope cut versus an oversight.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 👨‍💻 Author

Built by **Sukumar M** — exploring high-integrity citizen journalism and next-generation media marketplaces.
