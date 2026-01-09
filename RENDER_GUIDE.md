# 🚀 How to Deploy on Render.com

This project uses a **Node.js Backend** + **MongoDB**. Since Render does not provide a free MongoDB database, you will use **MongoDB Atlas** (Free) for the database and **Render** (Free) to host the website.

---

## Phase 1: Setup Database (MongoDB Atlas) 🍃
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up (it's free).
2.  Create a new **Cluster** (select the Free Shared Tier).
3.  **Create a User**: Go to "Database Access", add a new user (e.g., `admin`) and set a password. **Remember this password!**
4.  **Network Access**: Go to "Network Access" -> "Add IP Address" -> Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
5.  **Get Connection String**:
    *   Click "Connect" -> "Drivers" -> Copy the string.
    *   It looks like: `mongodb+srv://admin:<password>@cluster0.123ab.mongodb.net/?retryWrites=true&w=majority`
    *   Replace `<password>` with your actual password.

---

## Phase 2: Deploy Web Server (Render) ☁️
1.  Go to [Render.com](https://render.com/) and create an account.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub account and select this repository: `ubhava`.
4.  **Configure Settings**:
    *   **Name**: `ubhava-store` (or your choice)
    *   **Region**: Singapore or nearest to you.
    *   **Branch**: `master`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: Free

5.  **Environment Variables** (Important!):
    Scroll down to "Environment Variables" and add these:
    *   `MONGO_URI`: (Paste the connection string from Phase 1)
    *   `JWT_SECRET`: (Enter a random long secret key, e.g., `mysecretkey12345`)
    *   `NODE_ENV`: `production`

6.  Click **Create Web Service**.

---

## Phase 3: Wait & Verify ✅
Render will start building your app. It might take 2-3 minutes.
*   Watch the logs. If you see specific errors, check them.
*   Once done, you will see a URL (e.g., `https://ubhava-store.onrender.com`).
*   Click it! Your app should be live.

**Troubleshooting:**
*   **Database Error?** Check if `MONGO_URI` is correct and assumes "Allow Access from Anywhere" is on in Atlas.
*   **Blank Page?** Checking console logs in Render dashboard usually explains why.
