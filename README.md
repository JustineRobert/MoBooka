# MoBooka

MoBooka is a MERN-stack digital book marketplace designed for African mobile-first audiences. It supports author uploads, secure reader purchases, admin approval workflows, and Mobile Money payment integration.

## Architecture
- Frontend: React + Vite, React Router, mobile-first UI
- Backend: Node.js + Express, JWT auth, RBAC
- Database: MongoDB with Mongoose models
- Payments: Mock MTN MoMo / Airtel Money workflow with transaction records
- Storage: Local `uploads` storage placeholder; can be replaced with AWS S3 or Cloudinary

## Folder structure
- `backend/` - API server, auth, book management, payments, admin reports
- `frontend/` - React app, auth state, browsing, dashboards

## Run locally
### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. Fill in `JWT_SECRET`, MongoDB URI, SMTP settings and Mobile Money provider keys
5. For real provider webhooks, set `MTN_MOMO_API_SECRET`, `MTN_MOMO_WEBHOOK_SECRET`, `AIRTEL_MONEY_API_SECRET`, and `AIRTEL_MONEY_WEBHOOK_SECRET`
6. `npm run dev`

## Webhook simulator
From the backend folder, run:
```bash
npm run simulate-webhook -- --provider=mtn --reference=<transaction_reference> --status=success
```
Supply `--endpoint` to target a custom callback URL.

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Mobile app
1. `cd mobile`
2. `npm install`
3. `npm start`

> The mobile app uses Expo and connects to the backend API at `http://localhost:5000/api` by default. Adjust `mobile/src/api/api.js` if your backend runs on a different host.

## Support
- Email: titechaafrica@gmail.com
- Tel: +256782397907
- Website support page: `/support`
- Contact form endpoint: `POST /api/contact`

## Key APIs
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/books`
- `POST /api/books` (author)
- `POST /api/payments/initiate`
- `POST /api/payments/verify`
- `POST /api/contact`
- `GET /api/admin/reports` (admin)
