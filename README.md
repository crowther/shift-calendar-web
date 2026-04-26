# Shift Calendar Web App

Interactive calendar web application for viewing shift schedules.

## Features

- 🗓️ **Multiple views**: Month grid and list views
- 🎨 **Shift toggles**: Click to show/hide individual shifts
- 🔗 **Shareable links**: URL encodes selected shifts, view, and month
- 📱 **Responsive**: Works on desktop and mobile
- 📅 **iCal subscribe**: Import shifts into any calendar app
- ⚡ **Fast**: Vite build, optimised production bundle

## Development

### Prerequisites

- [mise](https://mise.jdx.dev/) — manages the Node version declared in `.mise.toml`
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

The dev server proxies API requests to `http://localhost:8000` (configured in `vite.config.js`).

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

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

**Services:**
- **api** (internal): FastAPI backend
- **web** (internal): Caddy serving the React app
- **caddy** (ports 80/443): Reverse proxy

### Architecture

```
User
 ↓
Caddy Proxy (:80/:443)
 ├──→ React frontend (web)
 └──→ API (api :8000) for /calendars/*
```

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
├── .mise.toml                      # Node version pin
├── eslint.config.js
├── index.html
├── vite.config.js
├── Dockerfile                      # Multi-stage build
├── Caddyfile.frontend              # Frontend server config
├── Caddyfile.proxy                 # Reverse proxy config
├── docker-compose.yml
└── package.json
```

## Configuration

### API Endpoint

In production, Caddy proxies `/calendars/*` and `/health` to the API container.

- **Development:** configured in [vite.config.js](vite.config.js)
- **Production:** configured in [Caddyfile.frontend](Caddyfile.frontend)

### Shift Colours

Edit CSS variables `--s1` through `--s5` in [src/index.css](src/index.css).

### Production Domain

Edit [Caddyfile.proxy](Caddyfile.proxy) and replace `localhost` with your domain.

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
curl http://localhost/calendars/all_shifts.ics
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
