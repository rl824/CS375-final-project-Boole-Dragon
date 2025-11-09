# Deal Finder

A web app for finding and sharing deals from around the web.

## Setup

### Database
```bash
# Install PostgreSQL if you haven't
# Then create the database and tables
psql -U postgres -f schema.sql
psql -U postgres -d deal_finder -f seed.sql
```

### Backend
```bash
# Install dependencies
npm install

# Create a .env file with your database credentials
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=deal_finder

# Start the server
npm start
```

### Frontend
```bash
cd client
npm install
npm start
```

The backend runs on port 3000, and the React app should open on port 3001.

## Team

- Rick Li
- Sami Alam
