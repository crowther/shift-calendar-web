# Shift Calendar Web App

Interactive calendar web application for viewing shift schedules with FullCalendar.

## Features

- 🗓️ **Multiple Views**: Month grid and list/agenda views
- 🎨 **Shift Toggles**: Click to show/hide shifts 1-5
- 🔗 **Shareable Links**: URL-based state (e.g., `?shifts=1,3,5`)
- 📱 **Responsive**: Works on desktop and mobile
- 🎨 **Color Coded**: Each shift has its own color
- ⚡ **Fast**: Vite build, optimized production bundle

## Development

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

The dev server proxies API requests to `http://api:8000` (configured in vite.config.js).

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

### Full Stack (API + Web + Proxy)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Services:**
- **web** (port 80): Frontend serving the React app
- **api** (internal): FastAPI backend
- **caddy** (ports 80/443): Reverse proxy handling HTTPS

### Architecture

```
User
 ↓
Caddy Proxy (:80/:443)
 ↓
Frontend (Caddy :80) ──→ API (FastAPI :8000)
```

## Project Structure

```
shift-calendar-web/
├── src/
│   ├── components/
│   │   ├── ShiftToggles.jsx    # Shift selection buttons
│   │   ├── ShiftToggles.css
│   │   ├── ViewSelector.jsx    # Month/List view switcher
│   │   └── ViewSelector.css
│   ├── App.jsx                 # Main component
│   ├── App.css
│   ├── main.jsx                # Entry point
│   ├── index.css               # Global styles
│   └── utils.js                # ICS parser, URL state
├── index.html
├── vite.config.js              # Vite configuration
├── Dockerfile                  # Multi-stage build
├── Caddyfile.frontend          # Frontend server config
├── Caddyfile.proxy             # Reverse proxy config
├── docker-compose.yml          # Full stack orchestration
└── package.json

## Configuration

### API Endpoint

The frontend expects the API at the same origin. In production, Caddy proxies `/calendars/*` and `/health` to the API container.

**Development:** Configured in [vite.config.js](vite.config.js#L8-L19)

**Production:** Configured in [Caddyfile.frontend](Caddyfile.frontend#L13-L14)

### Shift Colors

Edit colors in:
- [src/components/ShiftToggles.jsx](src/components/ShiftToggles.jsx#L3-L9)
- [src/utils.js](src/utils.js#L56-L62)

### Production Domain

For production deployment, edit [Caddyfile.proxy](Caddyfile.proxy) and replace `localhost` with your domain.

## URL Parameters

Share specific shift views:

- `?shifts=1` - Show only Shift 1
- `?shifts=1,3,5` - Show Shifts 1, 3, and 5
- `?shifts=1,2,3,4,5` - Show all shifts

## Troubleshooting

### "Failed to fetch" errors

- Ensure API container is running: `docker-compose ps api`
- Check API logs: `docker-compose logs api`
- Test API directly: `curl http://localhost/calendars/all_shifts.ics`

### Build fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Changes not showing

```bash
# Rebuild containers
docker-compose up -d --build
```

## Technologies

- **React** 18 - UI library
- **Vite** - Build tool and dev server
- **FullCalendar** - Calendar component
- **Caddy** - HTTP server and reverse proxy
- **Docker** - Containerization

## License

Part of the Shift Calendar system.
