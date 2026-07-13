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
platodo/
├── backend                Express API, auth, planner, AI parsing
├── frontend               Next.js web app
├── mobile/platodo-mobile  Expo React Native app
├── functions              Azure Functions timers and scheduled jobs
└── .github/workflows      CI/CD pipelines
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
cd backend && npm install
cd ../frontend && npm install
cd ../mobile/platodo-mobile && npm install
cd ../../functions && npm install
```

> In restricted/offline environments, `functions` install may fail while downloading Azure Functions Core Tools.

## Environment setup

### Backend: `backend/.env`

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

### Frontend: `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Mobile: `mobile/platodo-mobile/.env`

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

### Functions: `functions/local.settings.json`

Provide the same core values as backend:

- `AZURE_SQL_CONNECTION_STRING`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `FIREBASE_CREDENTIALS`

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
  - `frontend/README.md`
  - `mobile/platodo-mobile/README.md`
- CI workflow:
  - `.github/workflows/main_platodo-api-5202.yml`

## Contributing

Maintainer: [@bohdan5202](https://github.com/bohdan5202)

Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Keep changes focused with clear commit messages
4. Open a pull request with context, test notes, and screenshots for UI changes

For larger changes, open an issue first to align on scope.
