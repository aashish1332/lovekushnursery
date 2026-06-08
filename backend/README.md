# Love Kush Nursery — Backend API

Next.js App Router backend with TiDB Cloud (MySQL) + GitHub image hosting.

## Architecture

```
Admin uploads image
       ↓
  Sharp processes image (resize if >1920x1080, convert to WebP, optimize)
       ↓
  Upload to GitHub repo /plants/ folder
       ↓
  Generate jsDelivr CDN URL
       ↓
  Store plant data + CDN URL in TiDB Cloud
```

## CDN URL Format

```
https://cdn.jsdelivr.net/gh/yoema261-glitch/images/plants/{uuid}.webp
```

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

- **DATABASE_URL** — TiDB Cloud connection string
- **GITHUB_TOKEN** — GitHub Personal Access Token (needs `repo` scope)
- **GITHUB_OWNER** — `yoema261-glitch`
- **GITHUB_REPO** — `images`

### 3. Generate Prisma client

```bash
npm run db:generate
```

### 4. Push schema to TiDB Cloud

```bash
npm run db:push
```

### 5. Start development server

```bash
npm run dev
```

API runs at `http://localhost:3000/api/plants`

## API Endpoints

### Plants

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/plants` | Create plant (multipart/form-data with image) |
| `GET` | `/api/plants` | List plants (query: category, search, page, limit, sortBy, sortOrder) |
| `GET` | `/api/plants/:id` | Get single plant |
| `PUT` | `/api/plants/:id` | Update plant (optional new image) |
| `DELETE` | `/api/plants/:id` | Delete plant + remove image from GitHub |

### Create Plant (POST /api/plants)

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Plant name (max 255 chars) |
| `price` | number | Yes | Price in INR (must be positive) |
| `category` | string | Yes | indoor, outdoor, flowering, succulents, rare, herbs, trees |
| `description` | string | Yes | Plant description (max 5000 chars) |
| `howToPlant` | string | Yes | Planting instructions (max 10000 chars) |
| `image` | File | Yes | Image file (JPEG, PNG, WebP, GIF, TIFF, BMP — max 20MB) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Monstera Deliciosa",
    "price": 1299,
    "category": "indoor",
    "description": "...",
    "howToPlant": "...",
    "imageUrl": "https://cdn.jsdelivr.net/gh/yoema261-glitch/images/plants/uuid.webp",
    "imageKey": "plants/uuid.webp",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### List Plants (GET /api/plants)

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | — | Filter by category |
| `search` | string | — | Search name, description, category |
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page (max 50) |
| `sortBy` | string | createdAt | Sort field: name, price, createdAt |
| `sortOrder` | string | desc | Sort direction: asc, desc |

**Example:** `GET /api/plants?category=indoor&page=1&limit=8&sortBy=price&sortOrder=asc`

### Update Plant (PUT /api/plants/:id)

Same as POST but all fields are optional. Send only what changed.

If a new `image` is included, the old image is automatically deleted from GitHub.

### Delete Plant (DELETE /api/plants/:id)

Deletes the plant record AND removes the image from GitHub.

## Image Processing Pipeline

1. **Validate** — Check format (JPEG/PNG/WebP/GIF/TIFF/BMP) and size (max 20MB)
2. **Resize** — If dimensions exceed 1920×1080, resize maintaining aspect ratio (never upscale)
3. **Convert** — Convert to WebP format
4. **Optimize** — Quality 82%, max compression effort, smart chroma subsampling
5. **Upload** — Push to GitHub repo `/plants/` folder
6. **CDN URL** — Generate jsDelivr CDN URL from GitHub path

## TiDB Cloud Setup

1. Create account at [tidbcloud.com](https://tidbcloud.com)
2. Create a Serverless cluster (free tier works)
3. Create a database named `nursery_db`
4. Go to Connect → copy the connection string
5. Paste into `DATABASE_URL` in `.env`

## GitHub Setup

1. Create repo `images` at [github.com/yoema261-glitch/images](https://github.com/yoema261-glitch/images)
2. Go to Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
3. Create token with `Contents` read/write permission on the `images` repo
4. Paste token into `GITHUB_TOKEN` in `.env`

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── plants/
│   │   │       ├── route.ts           # GET (list), POST (create)
│   │   │       └── [id]/
│   │   │           └── route.ts       # GET, PUT, DELETE
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── validation.ts      # Zod schemas
│   │   ├── image.ts           # Sharp image processing
│   │   ├── github.ts          # GitHub API upload/delete
│   │   └── response.ts        # API response helpers
│   └── middleware.ts          # CORS
├── .env.example
├── next.config.js
├── package.json
└── tsconfig.json
```
