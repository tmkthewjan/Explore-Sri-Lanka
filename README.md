# 🇱🇰 Explore Sri Lanka – Full-Stack Tourism & PostGIS Geolocation Platform

A modern full-stack tourism and spatial discovery platform for exploring popular landmarks, hidden gems, pristine beaches, misty waterfalls, sacred heritage sites, and wildlife national parks across Sri Lanka.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Node.js / Express**, and a local **PostgreSQL + PostGIS** spatial database with **GiST indexing** and **Mapbox GL** interactive maps.

---

## 🌟 Key Features

- 📍 **Real-Time GPS Location Detection**: High-accuracy browser geolocation with dynamic search radius options (**5 km**, **10 km**, **25 km**, **50 km**).
- ⚡ **Native PostGIS Spatial Engine**: Native geodesic calculations on the curvature of the Earth (`geography(Point, 4326)`) accelerated with **GiST spatial indexes**.
- 🗺️ **Interactive Mapbox GL Maps**:
  - Live pulsing blue marker for current user location.
  - Interactive destination pins with custom category icons.
  - Clickable popups with cover images, details links, and navigation actions.
  - Smooth camera transitions (`flyTo`) when selecting places.
  - Automatic fallback to OpenStreetMap raster tiles if no Mapbox token is provided.
- 🔎 **Multi-Criteria Search & Filtering**:
  - Filter by Category (*Beach, Waterfall, Mountain, Heritage, Wildlife, Viewpoint, Temple*).
  - Filter by District & Province.
  - Full-text keyword search across titles and descriptions.
- 🧭 **Google Maps Turn-by-Turn Directions**: One-click direct route navigation from the user's current GPS position to any destination.
- 📱 **Responsive Modern Design**: Tropical Sri Lankan color aesthetic, glassmorphism UI, and mobile-ready layouts.
- 🛡️ **Offline Resilient Architecture**: Backend automatically handles database connection state gracefully with built-in Haversine spatial calculations as a fallback.

---

## 🏗️ System Architecture

```text
                  ┌─────────────────────┐
                  │     Next.js 15      │
                  │    Web Frontend     │
                  │   (Tailwind+Mapbox) │
                  └──────────┬──────────┘
                             │
                             │ REST API (JSON)
                             ▼
                  ┌─────────────────────┐
                  │   Express.js API    │
                  │  (Node.js + pgPool) │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │     PostgreSQL      │
                  │     + PostGIS       │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Places Table     │
                  │  location (Point,   │
                  │     SRID 4326)      │
                  │    GiST Indexed     │
                  └─────────────────────┘
```

---

## 🛠️ Technology Stack

- **Web Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons, Mapbox GL JS
- **Backend API**: Node.js, Express.js, PostgreSQL `pg` client, CORS, Morgan, Dotenv
- **Spatial Database**: PostgreSQL 16/17, PostGIS 3.x, GiST spatial indexing
- **Navigation**: Google Maps Directions URL API

---

## 📁 Repository Structure

```text
explore-sri-lanka/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL connection pool & PostGIS verification
│   │   ├── controllers/
│   │   │   └── placeController.js   # HTTP validation and response handler
│   │   ├── data/
│   │   │   └── samplePlaces.js      # Resilient fallback destination dataset
│   │   ├── middleware/
│   │   │   └── errorHandler.js      # Centralized error handler
│   │   ├── routes/
│   │   │   └── placeRoutes.js        # REST API endpoint definitions
│   │   ├── services/
│   │   │   └── placeService.js      # PostGIS queries & spatial distance calculations
│   │   ├── app.js                   # Express application configuration
│   │   └── server.js                # Server bootstrap & graceful shutdown
│   ├── .env.example
│   └── package.json
│
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout, Inter font, SEO OpenGraph metadata
│   │   │   ├── page.tsx             # Landing page (Hero, Categories, Nearby section)
│   │   │   ├── map/
│   │   │   │   └── page.tsx         # Interactive Map Explorer with filters
│   │   │   ├── places/[slug]/
│   │   │   │   └── page.tsx         # Place Details Page with specs & navigation
│   │   │   └── globals.css          # Tailwind, glassmorphism & pulsing GPS pin
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Sticky glassmorphism header navigation
│   │   │   ├── Footer.tsx           # Footer with links & tech stack badges
│   │   │   ├── MapboxMap.tsx        # Mapbox GL canvas with user marker & popups
│   │   │   ├── PlaceCard.tsx        # Destination card with distance & navigate links
│   │   │   └── NearbySection.tsx    # Live browser GPS proximity component
│   │   ├── lib/
│   │   │   ├── api.ts               # Type-safe API client for Express backend
│   │   │   └── utils.ts             # Tailwind merger & distance formatting
│   │   └── types/
│   │       └── place.ts             # TypeScript definitions
│   ├── .env.local.example
│   ├── tailwind.config.ts
│   └── package.json
│
├── database/
│   ├── 001_extensions.sql           # PostGIS extension initialization
│   ├── 002_tables.sql               # places table schema & spatial trigger
│   ├── 003_indexes.sql              # GiST spatial index & query indexes
│   ├── 004_functions.sql            # get_nearby_places() PostGIS function
│   └── 005_seed.sql                 # 20 curated Sri Lankan tourist destinations
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (Local PostgreSQL + PostGIS)

1. Ensure PostgreSQL (v15+) and the PostGIS bundle are installed.
2. In pgAdmin 4 or `psql`, run the SQL migrations in order:
   ```powershell
   # Create database
   psql -U postgres -c "CREATE DATABASE explore_sri_lanka;"

   # Run migrations in order
   psql -U postgres -d explore_sri_lanka -f "database/001_extensions.sql"
   psql -U postgres -d explore_sri_lanka -f "database/002_tables.sql"
   psql -U postgres -d explore_sri_lanka -f "database/003_indexes.sql"
   psql -U postgres -d explore_sri_lanka -f "database/004_functions.sql"
   psql -U postgres -d explore_sri_lanka -f "database/005_seed.sql"
   ```

### 2. Backend API Setup

```powershell
cd backend
npm install
# Configure backend/.env with your PostgreSQL credentials
npm run dev
```
Backend runs at: **http://localhost:5000**
Health check: **http://localhost:5000/api/health**

### 3. Web Frontend Setup

```powershell
cd ../web
npm install
npm run dev
```
Web application runs at: **http://localhost:3000**

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, database status & place count |
| `GET` | `/api/places` | List all places with category, district & style filters |
| `GET` | `/api/places/nearby?lat=...&lng=...&radius=...` | PostGIS spatial radius query sorted by distance |
| `GET` | `/api/places/search?q=...` | Keyword search across titles, districts, categories |
| `GET` | `/api/places/metadata` | Distinct categories and districts with counts |
| `GET` | `/api/places/:id` | Single place by UUID or slug with distance |

---

## 🗺️ Seeded Sri Lankan Destinations

Includes 20 world-famous landmarks with exact coordinates:
- **Sigiriya Ancient Rock Fortress** (Matale)
- **Galle Dutch Fort** (Galle)
- **Nine Arch Bridge** (Ella)
- **Diyaluma Falls & Natural Pools** (Badulla)
- **Unawatuna Coral Beach** (Galle)
- **Mirissa Beach & Coconut Tree Hill** (Matara)
- **Yala National Park Safari** (Hambantota)
- **Lake Gregory** (Nuwara Eliya)
- **Horton Plains & World's End** (Nuwara Eliya)
- **Adam's Peak (Sri Pada)** (Ratnapura)
- **Temple of the Sacred Tooth Relic** (Kandy)
- **Arugam Bay Surf Point** (Ampara)
- **Bentota Golden Beach** (Galle)
- **Knuckles Mountain Range** (Matale)
- **Pidurangala Rock Sunrise Viewpoint** (Matale)
- **Ella Rock Hiking Trail** (Badulla)
- **Ravana Falls & Caves** (Badulla)
- **Galle Face Green** (Colombo)
- **Pigeon Island National Park** (Trincomalee)
- **Udawalawe Elephant Sanctuary** (Ratnapura)

---

## 📄 License

MIT License &copy; Explore Sri Lanka Platform.
