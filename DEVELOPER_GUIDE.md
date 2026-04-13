# MoBooka Developer Guide

## Overview
MoBooka is a modern digital book marketplace built for mobile-first African audiences. It combines:
- A Node.js + Express backend API
- A React + Vite frontend web app
- An Expo React Native mobile app
- Mobile Money payment flow abstractions and webhook support
- Role-based access control for admins, authors, and readers

This guide helps new developers understand the repo, run the app locally, and contribute safely.

## Repository structure

- `backend/` - Express API server and data models
- `frontend/` - React web client
- `mobile/` - Expo React Native mobile client
- `README.md` - main project documentation
- `DEVELOPER_GUIDE.md` - developer onboarding and contribution guide

## Backend (API)

### Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. Set configuration values for MongoDB, JWT, SMTP, and Mobile Money providers
5. `npm run dev`

### Available scripts
- `npm run dev` - start backend with `nodemon`
- `npm start` - run production server
- `npm run simulate-webhook -- --provider=mtn --reference=<reference> --status=success` - simulate webhook delivery

### Environment variables
Common variables used by the backend:
- `PORT` - API port, default `5000`
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for signing JWT tokens
- `JWT_EXPIRES_IN` - token expiration, e.g. `7d`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - email transport
- `EMAIL_FROM` - sender address for notifications
- `SUPPORT_EMAIL` - contact email for support messages
- `MTN_MOMO_API_URL`, `MTN_MOMO_API_KEY`, `MTN_MOMO_API_SECRET` - MTN provider credentials
- `MTN_MOMO_WEBHOOK_SECRET` - MTN webhook signing secret
- `AIRTEL_MONEY_API_URL`, `AIRTEL_MONEY_API_KEY`, `AIRTEL_MONEY_API_SECRET` - Airtel provider credentials
- `AIRTEL_MONEY_WEBHOOK_SECRET` - Airtel webhook signing secret

### Key backend files
- `server.js` - application entrypoint, middleware, routes
- `config/db.js` - MongoDB connection helper
- `models/User.js`, `models/Book.js`, `models/Transaction.js` - data schemas
- `routes/auth.js` - authentication endpoints
- `routes/books.js` - book catalog and author uploads
- `routes/payments.js` - payment flow, verify, webhook, secure download
- `routes/transactions.js` - buyer and author transaction history
- `routes/contact.js` - public contact form endpoint
- `utils/notifications.js` - email sending helper
- `utils/mobileMoneyGateway.js` - provider abstraction
- `utils/webhookValidator.js` - webhook signature validation

### Important backend behavior
- Raw webhook bodies are captured in `express.json()` to validate signatures correctly.
- Contact messages are forwarded using SMTP when configured.
- Payment initiation saves transactions with a generated reference.
- Successful payment confirmation updates book sales, downloads, and earnings.

## Frontend (Web)

### Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Available scripts
- `npm run dev` - start Vite development server
- `npm run build` - build production assets
- `npm run preview` - preview production build

### Key files
- `src/App.jsx` - route definitions, header, footer integration
- `src/context/AuthContext.jsx` - auth state, JWT storage
- `src/pages/BookLibrary.jsx` - homepage and book listing
- `src/pages/Contact.jsx` - contact page form
- `src/pages/Support.jsx` - support details page
- `src/components/Logo.jsx` - brand logo component
- `src/components/Footer.jsx` - site footer component
- `src/styles.css` - theme, layout, and material-style UI tokens
- `src/api/api.js` - API request helper methods

### Notes
- The frontend communicates with the backend API via relative paths like `/api/*`.
- If the backend is served from a different host in development, update the API base URL in `frontend/src/api/api.js`.

## Mobile (Expo)

### Setup
1. `cd mobile`
2. `npm install`
3. `npm start`

### Available scripts
- `npm start` - launch Expo dev tools
- `npm run android` - open Android device/emulator
- `npm run ios` - open iOS simulator
- `npm run web` - run in browser

### Key files
- `App.js` - navigation setup and screen registration
- `src/context/AuthContext.js` - auth storage with AsyncStorage
- `src/api/api.js` - mobile API client
- `src/screens/*` - app screens for login, signup, books, details, dashboard

### Notes
- The mobile app uses `http://localhost:5000/api` by default.
- If your backend runs on another host or emulator interface, update `mobile/src/api/api.js`.

## Project conventions

- Use semantic route names and RESTful HTTP verbs.
- Keep UI components reusable and stateless when possible.
- Store secrets in `.env` and never commit them.
- Use consistent error handling via `asyncHandler` utilities on the backend.

## Deployment

### Web
- Build with `cd frontend && npm run build`
- Serve the output from `dist/` with any static hosting provider.

### Backend
- Ensure `NODE_ENV=production`
- Install dependencies and run `npm start`
- Use a real SMTP provider and secure webhook endpoints
- Connect to a production MongoDB cluster

### Mobile
- Use Expo to publish or build native binaries
- Verify the API base URL in `mobile/src/api/api.js`
- Configure `app.json` for release builds if needed

## Contribution guide

- Create feature branches from `main`
- Use clear commit messages describing what changed
- Test locally before pushing changes
- Document new API routes and env variables when adding features

## Troubleshooting

### CORS errors
- Make sure `backend/server.js` uses the correct `FRONTEND_URL` or `http://localhost:5173`

### Missing SMTP
- If SMTP is not configured, contact messages will still succeed but email dispatch is skipped.
- Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM`.

### Webhook validation
- Make sure the webhook secret values match the provider’s signing secret.
- The backend validates incoming payload signatures from `x-webhook-signature` or `x-signature`.

## Helpful commands
- `cd backend && npm run dev`
- `cd frontend && npm run dev`
- `cd mobile && npm start`
- `cd backend && npm run simulate-webhook -- --provider=mtn --reference=<reference> --status=success`

## Contact
If you are joining the project, start by reading `backend/README.md` and `mobile/README.md`, then follow the environment and setup sections in this developer guide.
