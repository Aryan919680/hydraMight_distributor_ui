# HydraMight Distributor UI

React/Vite UI for the Distributor Network Module using the existing HydraMight backend.

## Updated Distributor Flow

- Admin creates Stockist.
- Admin enters a simple `territory` input while creating stockist.
- Backend generates `referral_code` for stockist.
- Agency raises signup request from public UI.
- Referral code is optional during agency request.
- If referral code is provided and valid, system auto-matches stockist but request still remains pending.
- If referral code is not provided, admin selects stockist manually during approval.
- On approval, agency gets assigned stockist and same territory as selected/matched stockist.
- Agency login is created after approval.

## Included Screens

### Admin

- `/admin/login` uses existing API: `POST /api/auth/login`
- `/admin/distributors` dashboard
- `/admin/distributors/stockists` create/list stockists with territory + referral code
- `/admin/distributors/agency-requests` pending/approved/rejected agency requests with approve/reject
- `/admin/distributors/agencies` approved agencies list

### Distributor Portal

- `/distributor/login` uses: `POST /api/distributor/auth/login`
- `/distributor/agency-signup` public agency signup request using optional referral code
- `/distributor/dashboard` uses: `GET /api/distributor/auth/me`
- `/distributor/catalog` placeholder for next phase product/pricing APIs

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env` if backend is not running on localhost:4000:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Backend APIs Expected

```txt
POST /api/auth/login

POST /api/admin/distributors/stockists
GET  /api/admin/distributors/stockists

POST /api/distributor/agency-requests
GET  /api/admin/distributors/agency-requests?status=pending
POST /api/admin/distributors/agency-requests/:requestId/approve
POST /api/admin/distributors/agency-requests/:requestId/reject

GET  /api/admin/distributors/agencies
GET  /api/admin/distributors/stockists/:stockistId/agencies

POST /api/distributor/auth/login
GET  /api/distributor/auth/me
```

## Local Storage

Admin session:

```js
localStorage.admin_token
localStorage.admin_user
```

Distributor session:

```js
localStorage.distributor_token
localStorage.distributor_user
```
# hydraMight_distributor_ui
