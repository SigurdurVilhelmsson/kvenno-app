# KVENNO.APP - Unified Site Structure

This document defines the complete structure, design system, and navigation patterns for kvenno.app. **Copy this file to every repo** to give Claude Code the full context when working on individual projects.

## 1. Site Structure & URL Routing

```
kvenno.app/
├── /                                      (Track selector landing page - apps/landing)
│
├── /efnafraedi/                           (Chemistry track hub - apps/landing)
│   ├── /efnafraedi/1-ar/                  (1st year hub - apps/landing)
│   │   └── /efnafraedi/1-ar/games/        (Chemistry Games 1st yr - apps/games/1-ar/)
│   │
│   ├── /efnafraedi/2-ar/                  (2nd year hub - apps/landing)
│   │   ├── /efnafraedi/2-ar/games/        (Chemistry Games 2nd yr - apps/games/2-ar/)
│   │   └── /efnafraedi/2-ar/lab-reports/  (Lab Reports App - apps/lab-reports)
│   │
│   ├── /efnafraedi/3-ar/                  (3rd year hub - apps/landing)
│   │   ├── /efnafraedi/3-ar/games/        (Chemistry Games 3rd yr - apps/games/3-ar/)
│   │   └── /efnafraedi/3-ar/lab-reports/  (Lab Reports App - apps/lab-reports)
│   │
│   ├── /efnafraedi/val/                   (Elective courses hub - apps/landing)
│   └── /efnafraedi/f-bekkir/              (Social sciences track - apps/landing)
│
└── /islenskubraut/                        (Icelandic language cards - apps/islenskubraut)
```

Note: Legacy URLs (`/1-ar/`, `/2-ar/`, `/3-ar/`) redirect to `/efnafraedi/...` via nginx.

### Monorepo Apps

All code lives in a single pnpm monorepo (`kvenno-app/`):

- **Landing + Year Hubs** (`apps/landing`) - React SPA serving the track selector and all chemistry year hub pages
- **Lab Reports** (`apps/lab-reports`) - React SPA, deployed to 2 paths (2-ar, 3-ar) with separate builds
- **Chemistry Games** (`apps/games/`) - 17 single-file HTML games organized by year:
  - `apps/games/1-ar/` - 5 games for year 1
  - `apps/games/2-ar/` - 7 games for year 2
  - `apps/games/3-ar/` - 5 games for year 3
- **Islenskubraut** (`apps/islenskubraut`) - Icelandic language teaching cards SPA
- **Shared Library** (`packages/shared/`) - Components, hooks, utils, types, i18n, animations, sounds

### Deployment Strategy

Deployment is handled by the unified monorepo build system:

```bash
pnpm build          # Build everything to dist/
./scripts/deploy.sh # rsync to server + restart backend
```

The build script (`scripts/build-all.mjs`) handles multi-path builds automatically:
- Lab Reports is built twice (for `/efnafraedi/2-ar/lab-reports/` and `/efnafraedi/3-ar/lab-reports/`)
- Games are built as self-contained single HTML files via `vite-plugin-singlefile`
- Landing page serves all hub routes via React Router

## 2. Authentication & Access Control

### Overview

The kvenno.app site uses a mixed access model:
- **Open access**: Landing page, hub pages, and games (no authentication required)
- **Authenticated access**: Lab Reports and AI Tutor (require Azure AD login)

### Authentication Method

**Azure AD (Microsoft Entra ID)** via the Menntaský project
- Integrated with all Icelandic secondary schools and universities
- Users authenticate with their @kvenno.is school accounts
- Implemented using Microsoft Authentication Library (MSAL) for React

### Which Apps Require Authentication

**Protected Apps:**
- Lab Reports (`/efnafraedi/2-ar/lab-reports/`, `/efnafraedi/3-ar/lab-reports/`)

**Open Access:**
- Landing page (`/`)
- Chemistry track hub (`/efnafraedi/`)
- All year hub pages (`/efnafraedi/1-ar/`, `/efnafraedi/2-ar/`, `/efnafraedi/3-ar/`, `/efnafraedi/val/`, `/efnafraedi/f-bekkir/`)
- All games (`/efnafraedi/1-ar/games/`, `/efnafraedi/2-ar/games/`, `/efnafraedi/3-ar/games/`)
- Islenskubraut (`/islenskubraut/`)

### Role-Based Access Control

**Teachers:**
- Identified by email address (maintained in `TEACHER_EMAILS` array)
- Access to teacher features in Lab Reports (grading interface)
- Future: May expand to additional management features

**Students:**
- All other @kvenno.is users
- Access to student features only
- Cannot access teacher-specific pages

### Authentication Implementation Details

**For detailed implementation instructions**, see:
- `docs/azure-ad-setup.md` - Azure AD setup, auth flow, components, and troubleshooting

**Key Technologies:**
- `@azure/msal-browser` - Core authentication library
- `@azure/msal-react` - React integration and hooks
- Client-side authentication (no backend auth server needed)
- Automatic token refresh
- Secure token storage (handled by MSAL)

**Configuration:**
```typescript
// Environment variables required (.env)
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_TEACHER_EMAILS=teacher1@kvenno.is,teacher2@kvenno.is
```

**Deployment Considerations:**
- Each deployment path needs its own redirect URI registered in Azure AD
- Authentication works independently at each path
- Tokens are scoped per domain, not per path
- Multi-path builds work correctly with proper MSAL configuration

### Security Notes

⚠️ **Important Security Considerations:**

1. **Client-side role checks are for UX only**
   - Current implementation hides/shows features based on role
   - For critical operations, validate roles server-side (future enhancement)
   - Never trust client-side checks for authorization

2. **Credentials management**
   - All Azure AD credentials stored in `.env` files
   - `.env` files must be in `.gitignore`
   - Never commit actual credentials to git

3. **Token handling**
   - MSAL handles token storage securely
   - Tokens automatically refresh before expiration
   - Logout clears all tokens properly

4. **Multi-factor authentication**
   - Can be required at Azure AD level
   - Recommended for teacher accounts
   - Configure in Azure AD portal, not in app code

### Adding New Teachers

Teacher emails are managed via the `VITE_TEACHER_EMAILS` environment variable (comma-separated):

```bash
# In .env file for lab-reports
VITE_TEACHER_EMAILS=existing.teacher@kvenno.is,new.teacher@kvenno.is
```

After updating, rebuild and redeploy the lab-reports app. See `apps/lab-reports/src/utils/roles.ts` for implementation details.

### Future Authentication Enhancements

**Planned improvements:**
- Move from email list to Azure AD security groups
- Server-side role validation for critical operations
- Session timeout warnings for users
- Audit logging for teacher actions
- Admin panel for teacher management

## 3. Backend API & Security

### Critical Security Requirement

⚠️ **NEVER expose API keys in frontend code!**

Both LabReports and AI Tutor need to call the Claude API, but **API keys must NOT be stored in frontend environment variables** (variables starting with `VITE_`).

**Why this is critical:**
- Vite bundles environment variables into JavaScript at build time
- `VITE_` prefixed variables are embedded in the client-side code
- Anyone can open browser DevTools and extract your API key
- Exposed keys can be stolen and rack up huge API bills
- This violates Anthropic's terms of service

### Required Backend Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ HTTPS   │   Backend    │  HTTPS  │  Claude API │
│  (React App)├────────>│  (Node.js)   ├────────>│ (Anthropic) │
│             │         │  Port 8000   │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                              ↓
                        API Key stored
                        securely in .env
```

**Flow:**
1. React app sends request to `/api/analyze` (your backend)
2. Backend validates request (can check authentication)
3. Backend calls Claude API with secure key
4. Backend returns response to React app

### Backend Setup on Linode Server

**Step 1: Create backend directory**

```bash
# SSH to your server
ssh siggi@server

# Create backend directory
sudo mkdir -p /var/www/kvenno.app/backend
cd /var/www/kvenno.app/backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express @anthropic-ai/sdk cors dotenv
```

**Step 2: Create the backend server**

```bash
sudo nano /var/www/kvenno.app/backend/server.js
```

```javascript
// server.js
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration - only allow requests from your domain
app.use(cors({
  origin: ['https://kvenno.app', 'https://www.kvenno.app'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Claude API endpoint for LabReports
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt, systemPrompt, maxTokens = 4000 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
    });

    res.json(response);
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
});

// Claude API endpoint for AI Tutor (streaming support if needed)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt, maxTokens = 2000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt || '',
      messages: messages,
    });

    res.json(response);
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend API running on http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

**Step 3: Create environment file with API key**

```bash
# Create .env file (NEVER commit this to git!)
sudo nano /var/www/kvenno.app/backend/.env
```

```bash
# Backend environment variables
CLAUDE_API_KEY=your-actual-claude-api-key-here
PORT=8000
NODE_ENV=production
```

```bash
# Secure the .env file
sudo chmod 600 /var/www/kvenno.app/backend/.env
sudo chown www-data:www-data /var/www/kvenno.app/backend/.env
```

**Step 4: Create systemd service to keep backend running**

```bash
sudo nano /etc/systemd/system/kvenno-backend.service
```

```ini
[Unit]
Description=Kvenno.app Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kvenno.app/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/kvenno.app/backend/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=kvenno-backend

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable kvenno-backend
sudo systemctl start kvenno-backend

# Check status
sudo systemctl status kvenno-backend

# View logs
sudo journalctl -u kvenno-backend -f
```

**Step 5: Update nginx to proxy API requests**

Add this to your nginx kvenno.app server block (uncomment the existing API section):

```nginx
# Backend API proxy
location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Increase timeout for long API calls
    proxy_read_timeout 120s;
    proxy_connect_timeout 10s;
}
```

```bash
# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Frontend Configuration

**In React apps (LabReports, AI Tutor):**

```bash
# .env (in your LOCAL repo, for building)
VITE_API_ENDPOINT=https://kvenno.app/api

# For local development, you might use:
# VITE_API_ENDPOINT=http://localhost:8000/api
```

**Update your API utility file:**

```typescript
// src/utils/api.ts
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://kvenno.app/api';

export async function analyzeReport(prompt: string, systemPrompt?: string) {
  const response = await fetch(`${API_ENDPOINT}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      systemPrompt,
      maxTokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

### Environment Variables Summary

**Frontend (React apps) - .env in repo root:**
```bash
# These are SAFE to be public (baked into client JavaScript)
VITE_AZURE_CLIENT_ID=public-azure-client-id
VITE_AZURE_TENANT_ID=public-azure-tenant-id
VITE_API_ENDPOINT=https://kvenno.app/api
VITE_BASE_PATH=/2-ar/lab-reports/  # Set before each build
```

**Backend (Node.js server) - .env on server only:**
```bash
# These are SECRETS (never commit, never expose)
CLAUDE_API_KEY=sk-ant-api-key-here
PORT=8000
NODE_ENV=production
```

### Security Best Practices

**DO:**
✅ Store API keys in backend `.env` file only
✅ Set restrictive file permissions (600) on `.env`
✅ Run backend as non-root user (www-data)
✅ Use CORS to restrict API access to your domain
✅ Add rate limiting to prevent abuse
✅ Monitor API usage and costs
✅ Use systemd to auto-restart backend if it crashes
✅ Log errors for debugging

**DON'T:**
❌ Never put API keys in `VITE_` environment variables
❌ Never commit `.env` files to git
❌ Never expose backend to public internet directly (use nginx proxy)
❌ Never trust frontend validation alone (validate in backend too)
❌ Never skip authentication checks in backend endpoints

### Backend Management Commands

```bash
# Start backend
sudo systemctl start kvenno-backend

# Stop backend
sudo systemctl stop kvenno-backend

# Restart backend (after code changes)
sudo systemctl restart kvenno-backend

# Check status
sudo systemctl status kvenno-backend

# View real-time logs
sudo journalctl -u kvenno-backend -f

# View recent logs
sudo journalctl -u kvenno-backend -n 100

# Update backend code
cd /var/www/kvenno.app/backend
sudo nano server.js  # Make changes
sudo systemctl restart kvenno-backend
```

### Testing the Backend

```bash
# Test health endpoint
curl https://kvenno.app/api/health

# Test from your local machine during development
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, test message"}'
```

### Troubleshooting

**Backend won't start:**
```bash
# Check logs
sudo journalctl -u kvenno-backend -n 50

# Common issues:
# - Missing dependencies: cd /var/www/kvenno.app/backend && npm install
# - Port already in use: sudo lsof -i :8000
# - Permission issues: sudo chown -R www-data:www-data /var/www/kvenno.app/backend
```

**API requests timing out:**
```bash
# Check if backend is running
sudo systemctl status kvenno-backend

# Check nginx is proxying correctly
sudo tail -f /var/log/nginx/error.log

# Increase timeout in nginx if needed (already set to 120s)
```

**High API costs:**
```bash
# Add rate limiting to backend
npm install express-rate-limit

# In server.js:
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Future Backend Enhancements

**Planned improvements:**
- Add authentication middleware (verify Azure AD tokens)
- Add rate limiting per user (not just per IP)
- Add request logging and analytics
- Add API key rotation system
- Add backend validation of user roles
- Add caching for repeated requests
- Add request queue for high load
- Add API usage monitoring dashboard

## 4. Design System

### Brand Colors
- **Primary Orange**: `#f36b22` (Kvennaskólinn í Reykjavík brand color)
- **Background**: White or light gray (`#f5f5f5` for sections)
- **Text**: Dark gray/black (`#333333` for body text)
- **Accent/Links**: Consider darker shade of orange or complementary color

### Typography
- **Headings**: Sans-serif, bold
- **Body**: Sans-serif, regular weight
- **Specific fonts**: TBD - currently using system defaults

### Button/Tile Styling
All navigation buttons and tool tiles should use:
- Border: 2px solid #f36b22 (or filled background #f36b22 with white text)
- Border radius: 8px
- Padding: 16px 24px
- Hover state: Slightly darker shade or shadow effect
- Font size: 16-18px for buttons

### Layout Patterns
- **Maximum content width**: 1200px, centered
- **Spacing**: Consistent 16px or 24px grid
- **Responsive**: Mobile-first, stack tiles vertically on small screens

## 3. Header Component

Every page on kvenno.app must include a consistent header with:

```
┌─────────────────────────────────────────────┐
│ [Logo/Site Name]              [Admin] [Info] │
└─────────────────────────────────────────────┘
```

### Header Requirements:
- **Site name/logo**: "Efnafræðivefur Kvennó" or similar, links to `/`
- **Right-aligned buttons**: 
  - "Admin" (for teacher access)
  - "Info" (for help/about)
- **Background**: White with bottom border or subtle shadow
- **Height**: ~60px
- **Sticky**: Consider making header sticky on scroll

### Header Code Template:
```jsx
// Add to every app
<header className="site-header">
  <div className="header-content">
    <a href="/" className="site-logo">Efnafræðivefur Kvennó</a>
    <div className="header-actions">
      <button className="header-btn">Admin</button>
      <button className="header-btn">Info</button>
    </div>
  </div>
</header>
```

## 4. Navigation & Breadcrumbs

### Breadcrumb Pattern
Every sub-page must show its location in the hierarchy:

```
Heim > 1. ár > Lab Reports
```

- Always start with "Heim" (Home) linking to `/`
- Show current section (e.g., "1. ár")
- Show current app name (not linked)
- Style: Small text, gray, with > or / separators

### Back Navigation
Each app should also include a clear "Til baka" (Back) button that goes to its parent hub.

## 5. Landing Page (/)

The root landing page is a track selector containing:
1. **Header** (as defined above)
2. **Intro section**: Brief welcome text about Kvennaskólinn tools
3. **Main navigation tiles**: Track cards defined in `apps/landing/src/config/tracks.ts`:
   - **Efnafraedi** → `/efnafraedi/` (Chemistry track)
   - **Islenskubraut** → `/islenskubraut/` (Icelandic language track)

### Landing Page Layout:
```
┌─────────────────────────────────┐
│          Header                  │
├─────────────────────────────────┤
│                                  │
│  Welcome to Kvenno Chemistry     │
│  [Intro paragraph]               │
│                                  │
│  ┌──────────┐  ┌──────────┐    │
│  │  1. ár   │  │  2. ár   │    │
│  └──────────┘  └──────────┘    │
│                                  │
│  ┌──────────┐  ┌──────────┐    │
│  │  3. ár   │  │   Val    │    │
│  └──────────┘  └──────────┘    │
│                                  │
└─────────────────────────────────┘
```

## 6. Year/Section Hub Pages

Each hub page (1.ár, 2.ár, 3.ár, Val) has:
1. **Header** (consistent)
2. **Breadcrumbs**: `Heim > [Section Name]`
3. **Section title**: e.g., "1. árs verkfæri"
4. **Tool tiles**: Grid of available apps/tools
5. **Future expansion space**: Placeholder tiles for upcoming tools

### Tool Tile Structure:
Each tool tile should display:
- Icon or image (optional)
- Tool name (e.g., "Lab Reports")
- Brief description (1-2 sentences)
- Click → Navigate to tool

## 7. Individual App Pages

Each app (Lab Reports, AI Tutor, etc.) must include:

1. **Header** (consistent across site)
2. **Breadcrumbs**: `Heim > [Section] > [App Name]`
3. **App-specific content**
4. **Footer with navigation**: Link back to hub and home

### App Deployment:
- Each app is a separate React build
- Deployed to its designated path (e.g., `/1-ar/lab-reports/`)
- Uses `basename` in React Router if needed
- Must handle its own routing within its path

## 8. Monorepo Details

- **Repo Name**: kvenno-app
- **Deployed To**: `/var/www/kvenno.app/` (root level)
- **Purpose**: Unified monorepo containing all kvenno.app applications, shared components, server backend, and build infrastructure.
- **Current Status**: Deployed and in production
- **Technology**: pnpm monorepo, Vite + React + TypeScript + Tailwind CSS
- **Contains**:
  - Track selector landing page (`/`) and chemistry year hubs (`/efnafraedi/*`)
  - Lab reports SPA (`/efnafraedi/2-ar/lab-reports/`, `/efnafraedi/3-ar/lab-reports/`)
  - 17 chemistry games as single-file HTML builds
  - Islenskubraut teaching cards SPA (`/islenskubraut/`)
  - Express backend (`server/`) for Claude API proxy and PDF generation
  - Shared component library (`packages/shared/`)

## 9. Deployment Notes

### Monorepo Structure

```
kvenno-app/
├── apps/
│   ├── landing/          # Track selector + chemistry year hubs (React SPA)
│   ├── islenskubraut/    # Icelandic language teaching cards (React SPA)
│   ├── lab-reports/      # AI-powered lab report grading (React SPA)
│   └── games/            # 17 chemistry games (single-file HTML builds)
│       ├── 1-ar/         # 5 games for year 1
│       ├── 2-ar/         # 7 games for year 2
│       └── 3-ar/         # 5 games for year 3
├── packages/
│   └── shared/           # Shared components, hooks, utils, types, i18n
├── server/               # Express backend (Claude AI proxy + PDF generation)
├── scripts/              # Build and deploy scripts
├── docs/                 # Documentation
├── media/                # Favicons and brand assets
└── dist/                 # Build output (gitignored)
```

### Deployment Workflow

```bash
# Build everything
pnpm build

# Deploy to production (rsync + restart backend)
./scripts/deploy.sh
```

The build script (`scripts/build-all.mjs`) orchestrates all builds:
1. Builds the landing page SPA
2. Builds all 17 games as self-contained HTML files
3. Builds lab-reports twice (for 2-ar and 3-ar paths)
4. Builds islenskubraut SPA
5. Copies media assets

### Server Directory Structure (dist/)

```
dist/
├── index.html                         # Track selector SPA
├── assets/                            # Landing JS/CSS
├── media/                             # Favicons
├── efnafraedi/
│   ├── index.html                     # Chemistry hub (SPA fallback)
│   ├── 1-ar/
│   │   ├── index.html                 # Year 1 hub (SPA fallback)
│   │   └── games/*.html               # Self-contained games
│   ├── 2-ar/
│   │   ├── index.html
│   │   ├── games/...
│   │   └── lab-reports/               # SPA with assets/
│   ├── 3-ar/
│   │   ├── index.html
│   │   ├── games/...
│   │   └── lab-reports/
│   ├── val/index.html
│   └── f-bekkir/index.html
└── islenskubraut/
    ├── index.html                     # Islenskubraut SPA
    └── assets/
```

### Server Setup (nginx)
- All static files served from `/var/www/kvenno.app/`
- Express backend proxied at `/api/` (port 8000)
- SPA fallback routes configured per app
- HTTPS enforced via nginx
- Legacy URLs (`/1-ar/`, `/2-ar/`, etc.) redirect to `/efnafraedi/...`

### Environment Variables:
```bash
# Frontend (.env in repo root)
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_TEACHER_EMAILS=teacher1@kvenno.is,teacher2@kvenno.is

# Backend (server/.env on server only)
CLAUDE_API_KEY=sk-ant-api-key-here
PORT=8000
NODE_ENV=production
```

## 10. Development Workflow

All development happens in the unified `kvenno-app` monorepo:

```bash
pnpm install              # Install all dependencies
pnpm dev:landing          # Dev server for landing page
pnpm dev:lab-reports      # Dev server for lab reports
pnpm dev:islenskubraut    # Dev server for islenskubraut
pnpm dev:games            # Dev servers for all games
pnpm type-check           # TypeScript check across all packages
pnpm lint                 # ESLint check
pnpm test                 # Run unit tests (vitest)
pnpm test:e2e             # Run E2E tests (Playwright)
```

### Development Guidelines:
1. **Reference design system**: Use #f36b22, consistent button styles from Tailwind preset
2. **Use shared components**: Import Header, Breadcrumbs, Footer from `packages/shared/`
3. **Test navigation**: Make sure links and breadcrumbs work correctly
4. **Responsive**: Test on mobile sizes
5. **i18n**: Use `useGameI18n` hook for game translations (all 17 games support IS/EN/PL)

## 11. Icelandic Language

All user-facing text must be in Icelandic:
- "Heim" not "Home"
- "Til baka" not "Back"
- "Verkfæri" not "Tools"
- Consistent terminology across all apps

## 12. Authentication & Access Control

Authentication is handled by Azure AD (Microsoft Entra ID) via MSAL.js. See Section 2 above for full details and `docs/azure-ad-setup.md` for implementation guide.

**Protected apps**: Lab Reports (teacher grading interface)
**Authentication method**: Azure AD redirect flow with @kvenno.is school accounts
**Role system**: Teacher emails configured via `VITE_TEACHER_EMAILS` environment variable

## 13. Shared Hooks

The `packages/shared/hooks/` directory provides reusable hooks used across all games and apps:

- **`useGameProgress`** - Tracks game state (score, attempts, current question) with localStorage persistence
- **`useGameI18n`** - Internationalization for games; supports IS/EN/PL via `createGameTranslations()`
- **`useI18n`** - General-purpose i18n hook for non-game apps
- **`useAchievements`** - Achievement/badge system for games (unlock conditions, persistent state)
- **`useAccessibility`** - Accessibility features (reduced motion, font size, high contrast preferences)
- **`useProgress`** - Generic progress tracking hook
- **`useGameSounds`** - Web Audio API synthesized sounds (click, correct, wrong, level-complete, achievement, streak). Sounds default to OFF, persisted in localStorage (`kvenno-sound-enabled`).

Graphics/animation hooks (in `packages/shared/components/`):

- **`useParticleCelebration`** - Manages particle celebration lifecycle: triggering, queuing (up to 3), auto-advancing. Returns `triggerCorrect`, `triggerStreak`, `triggerLevelComplete`, `celebrationProps`.
- **`useScorePopups`** - Manages queue of floating "+N" score popups (max 5 concurrent, oldest evicted).

All hooks have unit tests in `packages/shared/hooks/__tests__/`.

## 14. Game Architecture (Refactored)

Games in `apps/games/` that have been refactored follow this structure:

```
apps/games/{year}/{game-name}/src/
├── App.tsx              # Main game component
├── main.tsx             # Entry point
├── i18n.ts              # Game-specific translations (IS/EN/PL)
├── components/          # UI components
├── data/                # Game data (questions, reactions, etc.)
├── utils/               # Game logic and helpers
└── __tests__/           # Unit tests
```

Refactored games include: `hess-law`, `kinetics`, `redox-reactions`, and others. Data and utility logic are extracted from monolithic components into separate `data/` and `utils/` directories for testability.

### Graphics & Animation Integration

All 17 games include the following shared graphics/animation components:

- **`AnimatedBackground`** — Wraps the menu/start screen with year-themed gradient blobs and floating chemistry SVGs
- **`ParticleCelebration`** + **`useParticleCelebration`** — Canvas particle overlay for correct answers (burst), streaks (escalating), and level completions (confetti + stars)
- **`SoundToggle`** + **`useGameSounds`** — Sound toggle button in menu header; `playCorrect`/`playWrong`/`playLevelComplete` calls in answer handlers
- **`game-card`** CSS class — Applied to level selection buttons for spring hover/press microinteractions

Year-theme palettes: 1-ar games use `yearTheme='1-ar'` (orange), 2-ar uses `'2-ar'` (teal), 3-ar uses `'3-ar'` (purple).

Zero external animation/sound libraries — all motion is CSS keyframes, Canvas 2D, and Web Audio API oscillators.

## 15. CI/CD Pipeline

### Continuous Integration (`.github/workflows/ci.yml`)

5 parallel jobs on every push/PR to `main`:

1. **Lint & Type Check** - ESLint + TypeScript `tsc --noEmit`
2. **Unit Tests** - Vitest with coverage reporting (~1022 tests)
3. **Server Tests** - Vitest for Express backend (~40 tests)
4. **Build** - Full production build to `dist/`
5. **E2E Tests** - Playwright (chromium + firefox), runs after build

### Deployment (`.github/workflows/deploy.yml`)

Manual or automated deployment via `./scripts/deploy.sh` (rsync to server + backend restart).

## 16. i18n System

All 17 chemistry games support internationalization via the `useGameI18n` hook:

- **Languages**: Icelandic (IS, default), English (EN), Polish (PL)
- **Implementation**: Each game has an `i18n.ts` file with `createGameTranslations()` calls
- **Coverage tracking**: See `docs/i18n-coverage.md` for per-game status

The shared i18n files live in `packages/shared/i18n/` (`is.json`, `en.json`, `pl.json`).

## 17. Testing Strategy

- **Unit tests**: Vitest for all packages and apps
- **E2E tests**: Playwright for integration testing (chromium + firefox)
- **Server tests**: Vitest + supertest for Express API testing
- **Coverage**: ~1062 total tests (1022 unit + 40 server)
- **Bundle analysis**: See `docs/bundle-sizes.md` for per-game bundle size tracking

---

## Quick Reference

**Primary Color**: #f36b22  
**Max Width**: 1200px  
**Header Height**: ~60px  
**Button Radius**: 8px  

**Key Links**:
- Home: `/`
- Chemistry Track: `/efnafraedi/`
- 1st Year: `/efnafraedi/1-ar/`
- 2nd Year: `/efnafraedi/2-ar/`
- 3rd Year: `/efnafraedi/3-ar/`
- Electives: `/efnafraedi/val/`
- Islenskubraut: `/islenskubraut/`

---

*Last updated: 2026-02-21*
*Maintainer: Sigurður E. Vilhelmsson, Kvennaskólinn í Reykjavík*
