# Preventiv App

A full-stack web application for managing **products** and creating **preventiva** (estimates/quotes), with a **bilingual PDF export (Albanian + English)**.

## Features

- **Authentication (Login)** with JWT (`POST /auth/login`)
  - Token is stored in `localStorage` and automatically sent as `Authorization: Bearer <token>`
  - Login form is configured to **avoid browser autofill**
- **Products**
  - CRUD: list, create, update, delete
  - Product image upload (`POST /products/{id}/image`)
  - Uploaded images are stored by the backend and served from `/uploads/...`
- **Preventiva**
  - Create a preventiva with line items (name/price/image snapshots at creation time)
  - List, detail view, delete
  - **Bilingual PDF export**: the same PDF contains **Albanian pages + English pages** (separated by pages)
  - PDF footer language matches the section (Albanian footer on Albanian pages, English footer on English pages)
- **Seller**
  - Seller contact info (phone, email, address) can be updated
  - Seller name is fixed in code: **Erald Leka**
- **Internationalization (i18n) in the web UI**
  - `sq` / `en` via `react-i18next`
  - Clickable flag switcher in the header, language is persisted in `localStorage`
- **CORS configured** for Vite development (e.g. `http://localhost:5173` / `5174`)

## Tech Stack

### Frontend (`/frontend`)

- React + Vite
- `react-router-dom` (routing + layout)
- `@tanstack/react-query` (data fetching, caching, invalidation)
- `axios` (HTTP client)
- `zustand` (auth store)
- `i18next` + `react-i18next` (translations)
- `react-hot-toast` (notifications)
- `lucide-react` (icons)

### Backend (`/backend`)

- FastAPI + Uvicorn
- SQLAlchemy + SQLite (`preventiv.db`)
- JWT via `python-jose`
- `passlib[bcrypt]` is installed (current login validates credentials from `.env`)
- `python-multipart` (file uploads)
- ReportLab (PDF generation)
- `pydantic-settings` + `.env` (configuration)

## Project Structure

```
preventive-app/
  backend/
    app/
      main.py              # FastAPI app + CORS + static uploads
      routers/             # auth, products, preventiva, seller
      services/            # pdf_service, seller_service
      models/              # SQLAlchemy models
      schemas/             # Pydantic schemas
    uploads/               # product images
    preventiv.db           # SQLite database
    seller_info.json       # seller contact info (name is forced in code)
    .env                   # backend settings

  frontend/
    src/
      i18n/                # i18n init + sq/en locales
      components/          # Layout + LanguageSwitcher
      pages/               # Login/Dashboard/Products/Preventiva/Settings
      api/                 # axios client + API wrappers
    .env                   # VITE_API_URL
```

## Environment Variables

### Backend (`backend/.env`)

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - login credentials
- `SECRET_KEY` - JWT signing secret (change for production)
- `ACCESS_TOKEN_EXPIRE_DAYS` - token expiration (days)
- `CORS_ORIGINS` - comma-separated list of allowed origins (e.g. `http://localhost:5174,...`)
- `CORS_ALLOW_ORIGIN_REGEX` - origin regex; defaults to allowing `localhost` / `127.0.0.1` on any port

### Frontend (`frontend/.env`)

- `VITE_API_URL` - backend base URL (e.g. `http://localhost:8000`)

## Run Locally (Development)

### 1) Backend

Windows (venv):

```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
.\venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

The backend will:
- create tables automatically in `preventiv.db`
- serve uploads at `http://localhost:8000/uploads/...`

### 2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` (or whichever port Vite chooses).

## API Endpoints

Note: Swagger UI is disabled (`docs_url=None`), so `/docs` is not available.

### Auth

- `POST /auth/login` -> returns `{ access_token, token_type }`

### Products

- `GET /products/`
- `POST /products/`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /products/{id}/image` (multipart upload)

### Preventiva

- `GET /preventiva/` (summary list)
- `GET /preventiva/{id}` (detail)
- `POST /preventiva/` (create)
- `DELETE /preventiva/{id}`
- `GET /preventiva/{id}/pdf` (download PDF)

### Seller

- `GET /seller/`
- `PUT /seller/`

## i18n (Web UI)

- Init: `frontend/src/i18n/index.js`
- Locales: `frontend/src/i18n/locales/sq.json`, `frontend/src/i18n/locales/en.json`
- Switcher: `frontend/src/components/LanguageSwitcher.jsx`
  - Uses flag images and persists the selected language in `localStorage`

## Bilingual PDF (Albanian + English)

- Generator: `backend/app/services/pdf_service.py`
- Behavior:
  - The PDF always includes **two sections**: Albanian first, then English (page break between them)
  - Footer text is rendered in the language of the section

## Troubleshooting

- **CORS error** from Vite:
  - add the correct origin to `backend/.env` (`CORS_ORIGINS=...`)
  - restart the backend after changing `.env`
- **401 Unauthorized**:
  - log in again (frontend removes the token automatically on 401)
  - verify `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env`
