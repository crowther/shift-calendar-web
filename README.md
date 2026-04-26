# Shift Calendar Web App

Interactive calendar web application for viewing shift schedules.

## Features

- **Multiple views**: Month grid and list views
- **Shift toggles**: Click to show/hide individual shifts
- **Shareable links**: URL encodes selected shifts, view, and month
- **Keyboard navigation**: Left/right arrow keys to step through months
- **Responsive**: Works on desktop and mobile
- **iCal subscribe**: Import shifts into any calendar app

## Development

### Prerequisites

- [mise](https://mise.jdx.dev/) — manages the Node version declared in `.mise.toml`
- npm

### Local Development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000/shift-calendar/](http://localhost:3000/shift-calendar/)

The dev server proxies `/shift-calendar/calendars/*` and `/shift-calendar/health` to a locally-running API at `http://localhost:8000` (configured in `vite.config.js`).

### Lint and format

```bash
npm run lint
npm run format
```

### Build

```bash
npm run build
npm run preview
```

## Docker Deployment

Copy `.env.example` to `.env` and configure your domain:

```bash
cp .env.example .env
```

Edit `.env`:

```
# Local testing
DOMAIN=localhost

# Production — bare hostname, no http:// prefix (Caddy handles TLS automatically)
DOMAIN=your-domain.com
```

Start all services:

```bash
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app is served at `/shift-calendar/`. Root and bare `/shift-calendar` redirect there automatically.

**TLS:** For a public domain, Caddy obtains a Let's Encrypt certificate automatically on first request. For `localhost`, Caddy serves HTTP only.

### Architecture

```
User
 ↓
Caddy Proxy (:80/:443)
 └── /shift-calendar/* → web (prefix stripped)
       ├── /calendars/* → api:8000
       └── /*           → React SPA (index.html)
```

**Services:**

- **api** (internal): FastAPI backend
- **web** (internal): Caddy serving the built React app
- **caddy** (ports 80/443): Reverse proxy, TLS termination

## Project Structure

```
shift-calendar-web/
├── src/
│   ├── components/
│   │   ├── GridView.jsx/css        # Month grid calendar
│   │   ├── ListView.jsx/css        # List/table view
│   │   ├── ShiftToggles.jsx/css    # Shift selection buttons
│   │   ├── SubscribePage.jsx/css   # iCal subscription links
│   │   └── ViewSelector.jsx/css    # Grid/List switcher
│   ├── hooks/
│   │   └── useCalendarData.js      # Data fetching and caching
│   ├── App.jsx                     # Root component, state owner
│   ├── App.css
│   ├── main.jsx                    # Entry point
│   ├── index.css                   # Global styles and shift colours
│   └── utils.js                    # ICS parser, URL state helpers
├── .env.example                    # Environment variable template
├── .mise.toml                      # Node version pin
├── eslint.config.js
├── index.html
├── vite.config.js
├── Dockerfile                      # Multi-stage build
├── Caddyfile.frontend              # Frontend container config
├── Caddyfile.proxy                 # Reverse proxy config
├── docker-compose.yml
└── package.json
```

## Configuration

### Domain

Set `DOMAIN` in `.env`. No `http://` prefix — Caddy infers the scheme:

| Value | Result |
|-------|--------|
| `localhost` | HTTP only, no TLS |
| `your-domain.com` | HTTPS with automatic Let's Encrypt certificate |

### Shift Colours

Edit CSS variables `--s1` through `--s5` in [src/index.css](src/index.css).

## URL Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `shifts` | `?shifts=1-3-5` | Hyphen-separated shift numbers to display |
| `view` | `?view=listMonth` | `dayGridMonth` (default) or `listMonth` |
| `month` | `?month=2026-04` | Deep-link to a specific month |

## Troubleshooting

### "Failed to fetch" errors

```bash
docker compose ps
docker compose logs api
curl http://localhost/shift-calendar/calendars/all_shifts.ics
```

### Build fails

```bash
rm -rf node_modules package-lock.json
npm install
```

### Changes not showing

```bash
docker compose up -d --build
```

## Technologies

- **React 18** — UI library
- **Vite** — build tool and dev server
- **FullCalendar** — calendar component
- **Caddy** — HTTP server and reverse proxy
- **Docker** — containerisation
