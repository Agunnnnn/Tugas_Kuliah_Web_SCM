# SupplyChainKu - Sistem Informasi Manajemen Rantai Pasok (SCM)

Aplikasi web **Supply Chain Management (SCM)** terintegrasi dengan arsitektur terpisah (`server` & `client`) berbasis **React, Tailwind CSS, Express.js, dan Supabase (PostgreSQL)**.

## Anggota Kelompok
- **PALAGUNA** (Ketua)
- **PUTRA RENO HARIYANTO**
- **IKHSAN DWI SAPUTRA**

## Struktur Folder
- `server/`: Backend REST API (Node.js + Express + Supabase JS Client)
- `client/`: Frontend SPA (React + Vite + Tailwind CSS v4)

## Cara Menjalankan Proyek

### 1. Setup Backend (`server`)
```bash
cd server
npm install
# Salin .env.example menjadi .env lalu isi SUPABASE_URL dan SUPABASE_ANON_KEY
cp .env.example .env
npm run dev
```
Server berjalan di `http://localhost:5000`.

### 2. Setup Frontend (`client`)
```bash
cd client
npm install
npm run dev
```
Client berjalan di `http://localhost:5173`.

