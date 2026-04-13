# Invoice & Payment Tracking System

Feature-based full stack application.

## Modules
- Authentication (current)

## Deployment Configuration
Set these values before deploying:

1. Backend `JWT_SECRET`
- Use a long random secret. Do not use placeholders.

2. Backend `MONGO_URI`
- Point to your production MongoDB database.

3. Backend `ALLOWED_ORIGINS`
- Set comma-separated frontend origins, for example:
`https://your-frontend.example.com`

4. Frontend `NEXT_PUBLIC_API_URL`
- Point to your deployed backend API base URL, for example:
`https://your-api.example.com`

Use these templates:
- `backend/.env.example`
- `frontend/.env.example`
