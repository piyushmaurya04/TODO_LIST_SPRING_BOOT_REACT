# Render Deployment Instructions

## Backend (Spring Boot)

- Uses H2 file-based database for persistence (see `application.properties`).
- Static files are served from `src/main/resources/static` (populated by frontend build).
- No MySQL required; H2 is used for both dev and prod.
- Profile: `prod` (set by Render env var in `render.yaml`).

## Frontend (React)

- Build output is placed in `src/main/resources/static`.
- API calls use relative `/api` path for production, so frontend and backend must be deployed together.
- Build command: `npm run build` (see `render.yaml`).

## Render Setup

- `render.yaml` defines two services: backend (Java) and frontend (static).
- Backend start command: `java -jar target/todo-list-0.0.1-SNAPSHOT.jar`
- Frontend build and publish path: `src/main/resources/static`

## CORS

- If you separate frontend/backend, add CORS config to backend.
- For single deployment, relative API paths are sufficient.

## H2 Console

- Disabled in production for security.

---

For any issues, check Render logs and ensure both services are healthy.
