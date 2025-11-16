# Authentication Setup

Cookie-based authentication using argon2 for password hashing.

## Database Migration

Run this after setting up the initial schema:

```bash
psql -U postgres -d deal_finder -f migrations/001_add_auth_fields.sql
```

## Environment Variables

Copy `.env.example` to `.env` and update:

```env
DB_PASSWORD=your_actual_password

# Optional - for email verification
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_username
SMTP_PASS=your_ethereal_password
```

Get free test SMTP credentials at [ethereal.email](https://ethereal.email/)

## Start the App

Backend:
```bash
npm install
npm start
```

Frontend:
```bash
cd client
npm install
echo "REACT_APP_API_URL=http://localhost:3000" > .env
npm start
```

## How It Works

### Login Flow
1. User sends email/password to `/api/auth/login`
2. Server verifies password with argon2
3. Generates random token, stores server-side
4. Sets httpOnly cookie with token
5. Browser automatically sends cookie on future requests

### Protected Routes
Middleware checks cookie, looks up token in server storage, attaches user to request.

### Logout
Deletes token from server storage and clears cookie.

## API Endpoints

**Auth:**
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login (sets cookie)
- POST `/api/auth/logout` - Logout (clears cookie)
- POST `/api/auth/verify-email` - Verify email
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password
- GET `/api/auth/me` - Get current user (requires auth)

**Deals:**
- GET `/api/deals` - Get all deals (public)
- POST `/api/deals` - Create deal (requires auth)
- PUT `/api/deals/:id` - Update deal (owner only)
- DELETE `/api/deals/:id` - Delete deal (owner only)

## Security

- httpOnly cookies (can't be stolen by XSS)
- sameSite: strict (CSRF protection)
- argon2 password hashing
- Server-side token storage
- Parameterized SQL queries
