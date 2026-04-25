# Quick Start Guide

## Try it Locally (Development)

### Option 1: Dev Server Only (Fastest)

```bash
cd /home/dan/projects/specials/shift-calendar-web

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Note:** This requires the API to be running separately:
```bash
cd /home/dan/projects/specials/shift-calendar-api
uvicorn main:app --reload
```

Visit: http://localhost:3000

### Option 2: Full Docker Stack (Production-like)

```bash
cd /home/dan/projects/specials/shift-calendar-web

# Build and start everything
docker-compose up -d

# Watch logs
docker-compose logs -f
```

Visit: http://localhost

This starts:
- ✅ API backend (FastAPI)
- ✅ Web frontend (React + Vite)
- ✅ Caddy reverse proxy

## Deploy to VPS

### 1. SSH into your server

```bash
ssh your-user@your-server-ip
```

### 2. Clone repositories

```bash
mkdir -p /opt/apps && cd /opt/apps

git clone <shift-calendar-generator-url> shift-calendar-generator
git clone <shift-calendar-api-url> shift-calendar-api
git clone <shift-calendar-web-url> shift-calendar-web
```

### 3. Configure domain

Edit `/opt/apps/shift-calendar-web/Caddyfile.proxy`:

```caddyfile
your-domain.com {
    reverse_proxy web:80

    log {
        output file /data/access.log
    }

    # ... rest of config
}
```

### 4. Configure DNS

In Cloudflare:
- Add A record pointing `your-domain.com` to your server IP
- Wait for DNS propagation (5-30 minutes)

### 5. Deploy

```bash
cd /opt/apps/shift-calendar-web

# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 6. Configure firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
```

### 7. Visit your site

https://your-domain.com

Caddy automatically handles SSL certificates!

## How to Use

1. **Select Shifts**: Click shift buttons (1-5) to toggle them on/off
2. **Switch Views**: Use "Month" or "List" buttons
3. **Share**: Copy the URL - it includes your selections (e.g., `?shifts=1,3,5`)
4. **Quick Actions**:
   - "Select All" - Show all 5 shifts
   - "Clear All" - Hide all shifts

## Management Commands

```bash
cd /opt/apps/shift-calendar-web

# Restart everything
docker-compose restart

# Update code and rebuild
git pull
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Check status
docker-compose ps

# Shell into container
docker-compose exec web sh
docker-compose exec api sh
```

## Customization

### Change Shift Colors

Edit `src/components/ShiftToggles.jsx`:

```javascript
const SHIFT_COLORS = {
  1: '#e74c3c',  // Red
  2: '#3498db',  // Blue
  3: '#2ecc71',  // Green
  4: '#f39c12',  // Orange
  5: '#9b59b6'   // Purple
}
```

Then rebuild:
```bash
docker-compose up -d --build web
```

### Modify Template

Edit the CSV template:
```bash
nano /opt/apps/shift-calendar-generator/template.csv
```

Restart to apply:
```bash
docker-compose restart api
```

## Troubleshooting

**Cannot access site:**
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs caddy
docker-compose logs web
docker-compose logs api
```

**API errors:**
```bash
# Test API directly
curl http://localhost/calendars/all_shifts.ics

# Check API health
curl http://localhost/health
```

**Build errors:**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**SSL not working:**
```bash
# Check Caddy logs
docker-compose logs caddy

# Verify DNS
dig your-domain.com +short

# Should return your server IP
```

## Next Steps

- [ ] Setup monitoring (UptimeRobot, Pingdom)
- [ ] Configure automated backups
- [ ] Add rate limiting
- [ ] Setup staging environment
- [ ] Enable Cloudflare proxy (orange cloud)
