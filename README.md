# Platodo

[![Backend Azure Deploy](https://github.com/bohdan5202/platodo/actions/workflows/main_platodo-api-5202.yml/badge.svg)](https://github.com/bohdan5202/platodo/actions/workflows/main_platodo-api-5202.yml)

Platodo is an AI-powered planner and task manager for students. It turns natural-language tasks into structured plans, schedules work dates, and warns users about deadline overload.

## Why Platodo is useful

- **Natural-language task capture**: users can type tasks like “Math homework by Friday,” and AI extracts title, subject, deadline, and priority.
- **Auto-planning**: each task gets a planned work date based on workload and due date.
- **Deadline conflict detection**: AI generates alerts when too many tasks fall on the same day.
- **Daily briefings**: scheduled morning summaries are generated and delivered to users.
- **Cross-platform clients**: web app (Next.js) and mobile app (Expo/React Native) share the same backend API.

## Project structure

```text
platodo/
├── backend/               # Express API + AI task parsing + auth + planner routes
├── frontend/              # Next.js web client
├── mobile/platodo-mobile/ # Expo React Native mobile client
├── functions/             # Azure Functions timers (morning briefing, deadline watcher)
└── .github/workflows/     # CI/CD workflow(s)
```

## How to get started

### 1) Prerequisites

- Node.js 20+
- npm 10+
- Azure SQL Database
- Azure OpenAI deployment
- Firebase project/service account (for push notifications)
- (Optional) Azure Communication Services Email (for verification and password reset emails)
- (Optional) Azure Functions Core Tools v4 for local timer-function development

### 2) Install dependencies

From the repository root:

```bash
cd /home/runner/work/platodo/platodo/backend && npm install
cd /home/runner/work/platodo/platodo/frontend && npm install
cd /home/runner/work/platodo/platodo/mobile/platodo-mobile && npm install
cd /home/runner/work/platodo/platodo/functions && npm install
```

> Note: in restricted/offline environments, `functions` install can fail while downloading Azure Functions Core Tools.

### 3) Configure environment variables

#### Backend (`backend/.env`)

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

#### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### Mobile (`mobile/platodo-mobile/.env`)

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

#### Azure Functions (`functions/local.settings.json`)

Use the same core values as backend:

- `AZURE_SQL_CONNECTION_STRING`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `FIREBASE_CREDENTIALS`

### 4) Run services

#### Backend

```bash
cd /home/runner/work/platodo/platodo/backend
npm run dev
```

API base URL: `http://localhost:8080`

#### Frontend (web)

```bash
cd /home/runner/work/platodo/platodo/frontend
npm run dev
```

Web app: `http://localhost:3000`

#### Mobile (Expo)

```bash
cd /home/runner/work/platodo/platodo/mobile/platodo-mobile
npm run start
```

#### Azure Functions (optional local run)

```bash
cd /home/runner/work/platodo/platodo/functions
npm run start
```

## Usage examples

### Register and login

```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","name":"Student","password":"StrongPass123!"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"StrongPass123!"}'
```

### Create a task in natural language

```bash
curl -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"text":"Read chapter 4 of biology by Friday at 5pm"}'
```

### Fetch planner data

```bash
curl -X GET http://localhost:8080/planner \
  -H "Authorization: ******"
```

## Scripts

### Backend (`backend/package.json`)

- `npm run dev` — start API with nodemon
- `npm start` — start API with node

### Frontend (`frontend/package.json`)

- `npm run dev` — run Next.js dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run ESLint

### Mobile (`mobile/platodo-mobile/package.json`)

- `npm run start` — Expo dev server
- `npm run android` — open Android target
- `npm run ios` — open iOS target
- `npm run web` — run Expo web target
- `npm run lint` — Expo lint

### Functions (`functions/package.json`)

- `npm run start` — start Azure Functions host
- `npm run test` — placeholder test script

## Where to get help

- Open an issue in this repository: <https://github.com/bohdan5202/platodo/issues>
- Review app-specific code and docs:
  - Web app: `frontend/README.md`
  - Mobile app: `mobile/platodo-mobile/README.md`
- Check workflow/deployment status in GitHub Actions:
  - `.github/workflows/main_platodo-api-5202.yml`

## Maintainers and contributing

- **Maintainer:** [@bohdan5202](https://github.com/bohdan5202)

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make focused changes with clear commit messages
4. Open a pull request with context, screenshots (if UI), and testing notes

If you plan larger changes, please open an issue first to discuss scope and approach.
