# MoBooka Backend

A secure Express.js API for the MoBooka digital publishing marketplace.

## Features
- JWT authentication with roles: Admin, Author, Reader
- Book upload workflow with draft/pending/published states
- Mobile Money-style payment flow support (MTN MoMo / Airtel Money)
- Secure download token endpoints
- Mongoose data models for users, books, transactions
- Role-based access control and request validation

## Quick start
1. Copy `.env.example` to `.env` and edit values.
2. `npm install`
3. `npm run dev`

## API structure
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/books`
- `POST /api/books`
- `POST /api/payments/initiate`
- `POST /api/payments/verify`
- `GET /api/download/:bookId`
- `GET /api/admin/reports`
