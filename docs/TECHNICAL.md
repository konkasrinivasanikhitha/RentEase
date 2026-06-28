# RentEase Technical Documentation

## Stack
- Frontend: HTML5, CSS3, JavaScript, React.js, React Router, Bootstrap, Vite.
- Backend: Node.js, Express.js, REST APIs.
- Database: MongoDB-ready configuration through `MONGO_URI`; local JSON storage is used for offline preview.

## Authentication
Users register or login through `/api/auth/register` and `/api/auth/login`. Successful responses return a JWT token and user profile. The frontend stores both in local storage and protects all application routes except login and register.

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/products`
- `GET /api/rentals`
- `POST /api/rentals`
- `POST /api/support`
- `GET /api/admin/summary`
- `POST /api/admin/restock`

## Deployment
1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `JWT_SECRET` and `MONGO_URI`.
4. Build with `npm run build`.
5. Start with `npm run server`.

The Express server serves both `/api` routes and the compiled React app from `dist`.
