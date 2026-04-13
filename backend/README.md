# Backend

## Environment
Create `.env` from `.env.example` and set real values:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/invoice_tracking
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

Production requirements:
- `JWT_SECRET` must be set and must not be a placeholder.
- `MONGO_URI` must be set.
- `ALLOWED_ORIGINS` must be set to your deployed frontend origin(s).

## Run

```bash
npm install
npm run dev
```

## Start (Production)

```bash
npm run start
```
