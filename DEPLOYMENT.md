# Deployment Guide (Render.com)

Deployment instructions for hosting the Boole Deals application on Render.com using a managed PostgreSQL database.

## Prerequisites
1.  GitHub repository with project code.
2.  Render.com account.

---

## Step 1: Create the Database

1.  Log in to your Render Dashboard.
2.  Click **New +** and select **PostgreSQL**.
3.  **Name**: `boole-deals-db` (or similar).
4.  **Region**: Choose the one closest to you (e.g., Ohio, Oregon, Frankfurt).
5.  **PostgreSQL Version**: 15 or 16 (default is fine).
6.  **Instance Type**: Select **Free** (if available) or the cheapest option.
7.  Click **Create Database**.
8.  **Wait** for the database to be created.
9.  Once created, look for the **Connections** section.
    *   Copy the **Internal Database URL** (starts with `postgres://...`). You will need this later.
    *   Also note the **External Database URL** if you want to connect from your computer to run migrations.

---

## Step 2: Deploy the Web Service

1.  Go back to the Render Dashboard.
2.  Click **New +** and select **Web Service**.
3.  Select **Build and deploy from a Git repository**.
4.  Connect your GitHub account and select your `CS375-final-project-Boole-Dragon` repository.
5.  **Name**: `boole-deals-app` (this will determine your URL, e.g., `boole-deals-app.onrender.com`).
6.  **Region**: Must be the **same region** as your database.
7.  **Branch**: `main`.
8.  **Root Directory**: Leave blank (defaults to root).
9.  **Runtime**: **Node**.
10. **Build Command**: `npm run build`
    *   *Note: We configured this script in `package.json` to install and build the React client.*
11. **Start Command**: `npm start`
12. **Instance Type**: **Free**.
13. **Environment Variables** (Click "Advanced" or scroll down):
    Add the following keys and values:

    | Key | Value |
    | --- | --- |
    | `NODE_ENV` | `production` |
    | `DATABASE_URL` | Paste the **Internal Database URL** from Step 1 |
    | `JWT_SECRET` | A long random string (e.g., `mysecretkey12345`) |
    | `FRONTEND_URL` | `https://<your-app-name>.onrender.com` (You'll know this after creation, or guess it based on the name) |
    | `SMTP_HOST` | (Optional) Your email provider host (e.g., `smtp.gmail.com`) |
    | `SMTP_USER` | (Optional) Your email address |
    | `SMTP_PASS` | (Optional) Your email password or app-specific password |

14. Click **Create Web Service**.

---

## Step 3: Run Database Migrations

Your production database is currently empty. You need to create the tables.

**Option A: Using Render Shell (Easiest)**
1.  Wait for the deploy to finish (it might fail initially because the DB is empty, that's okay).
2.  On the Web Service page, click the **Shell** tab.
3.  Run the following command to connect to your database (using the env var):
    ```bash
    node -e "const fs = require('fs'); const pool = require('./db'); const schema = fs.readFileSync('./schema.sql', 'utf8'); pool.query(schema).then(() => console.log('Schema applied!')).catch(e => console.error(e));"
    ```
    *Wait, the above command is a bit complex to type. Let's try a simpler way.*

    **Better Option A:**
    Since we don't have `psql` in the web service image by default, we can use a temporary Node script or connect externally.

**Option B: Connect Externally (Recommended)**
1.  Install a database tool like **pgAdmin**, **TablePlus**, or just use `psql` on your local machine.
2.  Copy the **External Database URL** from your Render Database dashboard.
3.  Run the schema file from your local machine against the remote database:
    ```powershell
    # Windows PowerShell
    $env:PGPASSWORD="<password_from_url>"
    psql -h <host> -U <user> -d <dbname> -f schema.sql
    ```
    *Or simply paste the contents of `schema.sql` into your SQL client connected to the remote DB.*

---

## Step 4: Verify Deployment

1.  Once the build finishes and the database is set up, visit your URL: `https://<your-app-name>.onrender.com`.
2.  Try to **Register** a new account.
3.  Try to **Post a Deal**.

## Troubleshooting

*   **Build Failed?** Check the logs. Ensure `npm run build` is working locally.
*   **"Internal Server Error"?** Check the logs. It's usually a database connection issue (wrong URL) or missing tables (forgot Step 3).
*   **White Screen?** The React app might not be serving correctly. Ensure `server.js` has the static file serving code (we added this!).
