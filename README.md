# 🔍 CitizenLens — AI-Verified Evidence & Breaking News Marketplace

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-emerald.svg)](https://mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> **CitizenLens** is a decentralized, secure digital evidence marketplace connecting eyewitness citizens, CCTV/dashcam operators, and broadcast news organizations. It automates media authentication using an AI/forensic verification agent pipeline, prevents content theft through DRM-protected previews, and safeguards broadcast acquisitions using invisible steganographic watermarks.

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

    subgraph "🤖 Automated Software Agents"
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

## 🤖 The 6 Automated Software Agents

| Agent | Trigger | Core Responsibility |
| :--- | :--- | :--- |
| **1. Verification Agent** | On upload | Runs SHA-256 cryptographic hashing, Error Level Analysis (ELA) for image tampering, extracts EXIF hardware/GPS footprint, and generates a **Trust Score (0-100)**. |
| **2. Watermark Agent** | Post-verification | Generates a dynamic diagonal semi-transparent protective SVG overlay on all preview media to prevent unauthorized broadcast prior to licensing. |
| **3. Payment & Escrow Agent** | On purchase | Implements an **80/20 Escrow Split** (80% credited directly to the citizen's wallet, 20% platform fee) and creates binding license certificates. |
| **4. Steganography Agent** | License issue | Embeds an **imperceptible digital signature** (Buyer Name, Email, Transaction ID) into the master file. If leaked, the source is cryptographically traceable. |
| **5. Freshness Agent** | Hourly Cron | Periodically tags content: 🔴 **BREAKING** (<6 hrs), 🟡 **RECENT** (<7 days), and 🔵 **ARCHIVAL** (>7 days, for comparison stories). |
| **6. Credit Points Agent** | Dynamic events | Calculates citizen reputation rank (Level 1 Rookie → Level 5 Legend) and converts points to **Marketplace Queue Visibility Boosts** at ₹0 platform cost. |

---

## 🔒 Dual-Layer Content Protection

### Layer 1: Browser-Level DRM (Pre-Purchase)
- **Context Menu Interception:** Blocks right-click saving.
- **Screen-Capture & Window Blur Defense:** If a user switches to a screen recording tool (OBS, Snipping Tool), the viewport blurs instantly with a security shield notice.
- **Keyboard Shortcut Blocker:** Intercepts `PrintScreen`, `Ctrl+S`, and `Ctrl+P`.

### Layer 2: Invisible Steganographic Watermarking (Post-Purchase)
- Unlike visible watermarks that ruin broadcast footage, the master file delivered to newsrooms appears 100% clean to the human eye.
- Behind the scenes, the **Steganography Agent** stamps the buyer's unique digital signature into the file's binary/EXIF matrix.
- An interactive **Forensic Proof Inspector** allows both platform admins and newsrooms to verify the integrity and ownership of any file.

---

## 📡 Complete REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create citizen or journalist account.
- `POST /api/auth/login` — Authenticate and receive JWT bearer token.
- `GET  /api/auth/me` — Retrieve authenticated user profile.

### Evidence Feed (`/api/evidence`)
- `POST /api/evidence` — Multipart file upload + automated verification pipeline.
- `GET  /api/evidence` — Public marketplace feed with search, media type, and trust score filtering.
- `GET  /api/evidence/:id` — Retrieve full evidence details and forensic authenticity ledger.
- `GET  /api/evidence/my` — Retrieve uploads made by the logged-in citizen.

### Licensing & Escrow (`/api/payment`)
- `POST /api/payment/checkout` — Execute license acquisition and trigger steganographic embedding.
- `GET  /api/payment/my-purchases` — Retrieve acquired licenses and master files.
- `GET  /api/payment/license/:id` — View official license certificate.

### Master Delivery (`/api/download`)
- `GET  /api/download/:purchaseId` — Stream high-resolution master file (restricted to authorized buyer).

### User Ledger & Gamification (`/api/user`)
- `GET  /api/user/wallet` — Retrieve available balance and lifetime earnings.
- `POST /api/user/withdraw` — Withdraw escrow funds to bank account via IMPS/NEFT.
- `GET  /api/user/credits` — Retrieve reputation points, rank level, and queue boost metrics.
- `GET  /api/user/leaderboard` — Community rankings of top verified reporters.

---

## 💻 Quickstart (Local Development)

### 1. Prerequisites
- **Node.js:** v18 or higher
- **MongoDB:** MongoDB Atlas Cloud connection string

### 2. Backend Setup
```bash
cd server
npm install
# Create .env from template
cp .env.example .env
# Start server
npm start
```
*Backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🚀 Cloud Deployment Guide

1. **Database:** Deploy free M0 cluster on [MongoDB Atlas](https://mongodb.com/atlas) with IP whitelist set to `0.0.0.0/0`.
2. **Backend:** Deploy `server/` to [Railway](https://railway.app) or [Render](https://render.com) using environment variables from `.env.example`.
3. **Frontend:** Connect `client/` to [Vercel](https://vercel.com) (pre-configured with `vercel.json` SPA rewrites).

---

## 👨‍💻 Author
Built with passion by **Sukumar M** for high-integrity citizen journalism and next-generation media marketplaces.
