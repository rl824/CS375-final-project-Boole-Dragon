# Deal Finder

A full-stack web application for discovering and sharing product deals from around the web, featuring user authentication, email verification, and secure deal posting.

## Features

- 🔐 **Complete Authentication System**
  - User registration with email verification
  - Secure JWT-based login
  - Password reset functionality
  - "Remember me" option

- 💰 **Deal Management**
  - Browse deals publicly
  - Post deals (requires authentication)
  - Edit/delete your own deals
  - Category filtering and search

- 🎨 **Modern UI**
  - Dark theme design
  - Responsive layout
  - Real-time updates
  - Smooth animations

## Tech Stack

**Frontend:**
- React 19.2.0
- React Router 6+ (navigation)
- Axios (HTTP client with cookie support)
- Context API (state management)

**Backend:**
- Node.js + Express 4.18.2
- PostgreSQL 8+ (database)
- Cookie-based authentication (following CS375 demo pattern)
- argon2 (password hashing - industry standard)
- cookie-parser (cookie middleware)
- Nodemailer (email service)

## Quick Start

### 1. Database Setup

```bash
# Install PostgreSQL if you haven't
# Create the database and initial schema
psql -U postgres -f schema.sql

# Run authentication migration
psql -U postgres -d deal_finder -f migrations/001_add_auth_fields.sql

# (Optional) Seed with sample data
psql -U postgres -d deal_finder -f seed.sql
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and set:
# - DB_PASSWORD
# - SMTP credentials (optional for development)

# Start the server
npm start
```

### 3. Frontend Setup

```bash
cd client
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Start the React app
npm start
```

The backend runs on http://localhost:3000, and the React app opens on http://localhost:3001.

## Authentication Setup

For detailed authentication setup instructions, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md).

**Quick setup:**
1. Configure database credentials in `.env`
2. (Optional) Configure SMTP or use Ethereal Email for testing
3. Run database migration
4. Register a user and verify email

**Note:** Uses cookie-based authentication with argon2 password hashing.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user (protected)

### Deals
- `GET /api/deals` - Get all deals (public)
- `GET /api/deals/:id` - Get single deal (public)
- `POST /api/deals` - Create deal (protected)
- `PUT /api/deals/:id` - Update deal (protected, owner only)
- `DELETE /api/deals/:id` - Delete deal (protected, owner only)

## Project Structure

```
├── server.js              # Express server entry point
├── db.js                  # PostgreSQL connection pool
├── schema.sql             # Database schema
├── migrations/            # Database migrations
├── routes/
│   ├── auth.js           # Authentication routes
│   └── deals.js          # Deal routes
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── utils/
│   └── email.js          # Email service utilities
└── client/
    ├── src/
    │   ├── pages/        # Page components
    │   ├── components/   # Reusable components
    │   ├── context/      # React context (auth)
    │   └── App.js        # Main app with routing
    └── public/           # Static assets
```

## Security Features

- ✅ Cookie-based authentication with server-side sessions
- ✅ argon2 password hashing (industry standard, better than bcrypt)
- ✅ httpOnly cookies (XSS protection)
- ✅ secure flag (HTTPS only)
- ✅ sameSite: 'strict' (CSRF protection)
- ✅ Email verification required
- ✅ Parameterized SQL queries (SQL injection protection)
- ✅ CORS configured with credentials support
- ✅ Input validation on all endpoints
- ✅ Owner-only access control
- ✅ Request body size limits

## Development

### Running Tests

```bash
cd client
npm test
```

### Building for Production

```bash
# Build frontend
cd client
npm run build

# The build output will be in client/build/
```

## Team

- Rick Li (@rl824)
- Sami Alam

Drexel University CS-375 Final Project - Fall 2025-26

## License

MIT
