# MeetApp

A full-stack meeting scheduling application with Google OAuth, recurring events, real-time notifications, and map-based location picking.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT, Passport |
| **Frontend** | React 19, Redux Toolkit, Material UI 6, react-big-calendar, Leaflet |

## Architecture

The backend follows a layered architecture:

```
Routes → Controllers → Services → DAL → Models
```

- **Routes** define endpoints and wire up middleware (auth, validation)
- **Controllers** handle HTTP request/response and emit Socket.IO events
- **Services** contain business logic (CRUD, RSVP, rrule expansion)
- **DAL** (Data Access Layer) wraps Mongoose queries
- **Models** define MongoDB schemas

Validation uses Zod schemas applied via `validate()` middleware.

## Features

- Google OAuth 2.0 login with PKCE flow
- Meeting CRUD with title, description, location, date/time
- Recurring events via rrule (daily, weekly, monthly, etc.)
- RSVP per single occurrence or all occurrences
- Participant management (add/remove, default status)
- Real-time notifications via Socket.IO
- Interactive map-based location picker (Leaflet)
- Full calendar view (react-big-calendar)
- User search for adding participants

## Prerequisites

- Node.js (v18+)
- MongoDB instance
- Google OAuth 2.0 credentials (Client ID + Client Secret)

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd computer-network-project

# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix client

# Start both backend and frontend in development mode
npm run dev
```

## Environment Variables

### Root `.env`

| Variable | Description |
|---|---|
| `MONGO_USERNAME` | MongoDB username |
| `MONGO_PASSWORD` | MongoDB password |
| `DB_NAME` | MongoDB database name |
| `CLIENT_ID` | Google OAuth Client ID |
| `CLIENT_SECRET` | Google OAuth Client Secret |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |

### `client/.env.development`

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL (e.g. `http://localhost:5000`) |
| `REACT_APP_SOCKET_URL` | Socket.IO server URL (e.g. `http://localhost:5000`) |

## API Endpoints

All API routes are prefixed with `/api/v1`. Protected routes require a `Bearer` token in the `Authorization` header.

### Auth

| Method | Path | Description |
|---|---|---|
| GET | `/auth/google` | Initiate Google OAuth (with PKCE `code_challenge`) |
| GET | `/auth/google/callback` | OAuth callback (redirects to frontend) |
| POST | `/api/v1/auth/token` | Exchange auth code for token pair |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Invalidate refresh token |
| GET | `/api/v1/users/me` | Get current authenticated user |

### Meetings

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/meetings` | Create a meeting |
| GET | `/api/v1/meetings` | List meetings by date range |
| GET | `/api/v1/meetings/:id` | Get a single meeting |
| PUT | `/api/v1/meetings/:id` | Update a meeting |
| DELETE | `/api/v1/meetings/:id` | Delete a meeting |
| GET | `/api/v1/users/me/meetings` | Get current user's meetings |
| POST | `/api/v1/meetings/:id/rsvp` | RSVP to a single occurrence |
| POST | `/api/v1/meetings/:id/rsvp/all` | RSVP to all occurrences |
| POST | `/api/v1/meetings/:id/participants` | Add a participant |
| DELETE | `/api/v1/meetings/:id/participants` | Remove a participant |

### Users

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/users/search` | Search users by name or email |

### Notifications

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/notifications` | Get unacknowledged notifications |
| PATCH | `/api/v1/notifications/ack-all` | Acknowledge all notifications |
| PATCH | `/api/v1/notifications/:id/ack` | Acknowledge a single notification |
