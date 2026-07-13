# Platodo

[![Backend Azure Deploy](https://github.com/bohdan5202/platodo/actions/workflows/main_platodo-api-5202.yml/badge.svg)](https://github.com/bohdan5202/platodo/actions/workflows/main_platodo-api-5202.yml)

Platodo is an AI-powered student planner that turns natural-language tasks into structured plans, schedules work sessions, and warns about deadline overload.

## What Platodo provides

- Natural-language task intake with AI extraction of key fields
- Automatic planning and work-date suggestions
- Deadline conflict detection and proactive reminders
- Morning briefings and notification workflows
- Unified backend powering web and mobile clients

## Repository overview

```text
platodo/
├── backend                Express API, authentication, planner, AI parsing
├── frontend               Next.js web application
├── mobile/platodo-mobile  Expo React Native mobile application
├── functions              Azure Functions for scheduled background jobs
└── .github/workflows      CI/CD workflows
```

## Core services

- **Backend API (`backend`)**: Handles authentication, task management, planner logic, and AI-assisted parsing.
- **Web app (`frontend`)**: Browser client for task input, planning views, and account usage.
- **Mobile app (`mobile/platodo-mobile`)**: Mobile interface for planning and notifications.
- **Background jobs (`functions`)**: Time-based automations such as deadline checks and morning briefings.

## Platform dependencies

- Azure SQL Database for persistent task and user data
- Azure OpenAI for natural-language understanding and planning support
- Firebase for push notification delivery
- Optional Azure Communication Services Email for account emails

## Operations and quality

- Backend deployment status is visible via the workflow badge above
- CI/CD configuration is stored in `.github/workflows/main_platodo-api-5202.yml`
- Functions package currently exposes a placeholder test command

## Additional project references

- Web app details: `frontend/README.md`
- Mobile app details: `mobile/platodo-mobile/README.md`
- Issue tracking: <https://github.com/bohdan5202/platodo/issues>

## Maintainer

[@bohdan5202](https://github.com/bohdan5202)
