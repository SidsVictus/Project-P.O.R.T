<div align="center">
  <img src="frontend/public/bookmark.png" alt="P.O.R.T" width="80" />
  <h1>P.O.R.T</h1>
  <p><strong>Deploy Anything. Everywhere.</strong></p>
  <p>A browser-based deployment hub that lets you upload website files, pick a hosting provider, and deploy — all from one place.</p>
</div>

## Features

- **Multi-Provider Deploy** — Deploy to Netlify, Vercel, GitHub Pages, Cloudflare, Firebase, and Surge from a single interface
- **Google OAuth** — Secure sign-in with Supabase authentication
- **File Upload** — Drag-and-drop with folder structure preservation (client-side zip, server-side extract)
- **Scheduled Deploys** — Set date and time for auto-deployment
- **Git Webhooks** — Auto-deploy on every GitHub push
- **Analytics** — Track visits to your deployed sites
- **Notifications** — Email and Slack alerts on deploy status
- **Custom CLI Providers** — Add your own hosting providers via CLI
- **Existing Site Discovery** — Pull in sites already deployed on connected providers
- **Real-time Terminal** — Live deploy output with streaming logs

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, Socket.io-client
- **Backend:** Node.js, Express, TypeScript, Socket.io, BullMQ + Upstash Redis
- **Database:** Supabase (PostgreSQL + Auth), Neon PostgreSQL
- **Hosting:** Backend on Render, Frontend on Surge

## Getting Started

```bash
# Clone
git clone https://github.com/SidsVictus/Project-P.O.R.T.git
cd Project-P.O.R.T

# Backend
cd backend
npm install
cp ../.env .env
npm run dev

# Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

Create a `.env` in the root with:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
DATABASE_URL=
REDIS_URL=
ENCRYPTION_KEY=
FRONTEND_URL=http://localhost:5173
```

## Live

→ [projectport.surge.sh](https://projectport.surge.sh)

## License

MIT
