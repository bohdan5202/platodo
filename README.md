# Platodo

[![Backend Azure Deploy](https://github.com/bohdan5202/platodo/actions/workflows/main_platodo-api-5202.yml/badge.svg)](https://github.com/bohdan5202/platodo/actions/workflows/main_platodo-api-5202.yml)

Platodo is an AI-powered planner for students. It converts natural-language tasks into structured plans, schedules work sessions, and helps users avoid deadline overload.

## Key features

- Natural-language task capture with AI extraction (title, subject, deadline, priority)
- Automatic planning and work-date suggestions
- Deadline conflict detection and proactive alerts
- Morning briefings and reminders
- Web + mobile clients backed by a shared API

## Repository structure

```text
/home/runner/work/platodo/platodo
├── /backend                Express API, auth, planner, AI parsing
├── /frontend               Next.js web app
├── /mobile/platodo-mobile  Expo React Native app
├── /functions              Azure Functions timers and scheduled jobs
└── /.github/workflows      CI/CD pipelines
```

## Prerequisites

- Node.js 20+
- npm 10+
- Azure SQL Database
- Azure OpenAI deployment
- Firebase project/service account (push notifications)
- Optional: Azure Communication Services Email (verification and reset emails)
- Optional: Azure Functions Core Tools v4 (local Functions runtime)

## Installation

Install dependencies for each app:

```bash
cd /home/runner/work/platodo/platodo/backend && npm install
cd /home/runner/work/platodo/platodo/frontend && npm install
cd /home/runner/work/platodo/platodo/mobile/platodo-mobile && npm install
cd /home/runner/work/platodo/platodo/functions && npm install
```

> In restricted/offline environments, `functions` install may fail while downloading Azure Functions Core Tools.

## Environment setup

### Backend: `/home/runner/work/platodo/platodo/backend/.env`

```bash
PORT=8080
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

AZURE_SQL_CONNECTION_STRING=<your_sql_connection_string>
JWT_SECRET=<your_jwt_secret>

AZURE_OPENAI_ENDPOINT=<your_azure_openai_endpoint>
AZURE_OPENAI_KEY=<your_azure_openai_key>
AZURE_OPENAI_DEPLOYMENT=<your_deployment_name>

FIREBASE_CREDENTIALS=<json_stringified_service_account>

# Optional for email verification / reset
ACS_CONNECTION_STRING=<your_acs_connection_string>
ACS_SENDER_EMAIL=<your_verified_sender>
```

### Frontend: `/home/runner/work/platodo/platodo/frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Mobile: `/home/runner/work/platodo/platodo/mobile/platodo-mobile/.env`

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

### Functions: `/home/runner/work/platodo/platodo/functions/local.settings.json`

Provide the same core values as backend:

- `AZURE_SQL_CONNECTION_STRING`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `FIREBASE_CREDENTIALS`

## Run locally

### Backend

```bash
cd /home/runner/work/platodo/platodo/backend
npm run dev
```

API base URL: `http://localhost:8080`

### Frontend

```bash
cd /home/runner/work/platodo/platodo/frontend
npm run dev
```

Web app: `http://localhost:3000`

### Mobile (Expo)

```bash
cd /home/runner/work/platodo/platodo/mobile/platodo-mobile
npm run start
```

### Azure Functions (optional)

```bash
cd /home/runner/work/platodo/platodo/functions
npm run start
```

## API quick examples

### Register + login

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","name":"Student","password":"StrongPass123!"}'

curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"StrongPass123!"}'
```

### Create task from natural language

```bash
curl -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"text":"Read chapter 4 of biology by Friday at 5pm"}'
```

### Fetch planner

```bash
curl -X GET http://localhost:8080/planner \
  -H "Authorization: ******"
```

## Script reference

### Backend (`backend/package.json`)

- `npm run dev` — start API with nodemon
- `npm start` — start API with Node.js

### Frontend (`frontend/package.json`)

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint

### Mobile (`mobile/platodo-mobile/package.json`)

- `npm run start` — Expo dev server
- `npm run android` — Android target
- `npm run ios` — iOS target
- `npm run web` — Expo web target
- `npm run lint` — Expo lint

### Functions (`functions/package.json`)

- `npm run start` — Azure Functions host
- `npm run test` — placeholder test script

## Support

- Open issues: <https://github.com/bohdan5202/platodo/issues>
- App-specific docs:
  - `/home/runner/work/platodo/platodo/frontend/README.md`
  - `/home/runner/work/platodo/platodo/mobile/platodo-mobile/README.md`
- CI workflow:
  - `/home/runner/work/platodo/platodo/.github/workflows/main_platodo-api-5202.yml`

## Contributing

Maintainer: [@bohdan5202](https://github.com/bohdan5202)

Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Keep changes focused with clear commit messages
4. Open a pull request with context, test notes, and screenshots for UI changes

For larger changes, open an issue first to align on scope.
