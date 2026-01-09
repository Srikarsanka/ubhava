# Deployment Guide for "New Era Udbhava" 🚀

This guide explains how to deploy the application to a Linux server (VPS like DigitalOcean, AWS EC2, Linode) or a Docker-based platform.

## Option 1: Docker Deployment (Recommended) 🐳
This is the easiest method. It runs the App and Database together.

### Prerequisites
- A server with **Docker** and **Docker Compose** installed.

### Steps
1.  **Clone the Repository** on your server:
    ```bash
    git clone https://github.com/Srikarsanka/ubhava.git
    cd ubhava
    ```
2.  **Create `.env` File** (Optional, overrides docker-compose defaults):
    ```bash
    nano .env
    ```
    Paste your secrets:
    ```
    JWT_SECRET=your_super_secure_secret
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```
3.  **Run with Docker Compose**:
    ```bash
    docker compose up -d --build
    ```
4.  **Done!** Your app is live at `http://your-server-ip:3000`.

---

## Option 2: Manual Node.js Deployment 🛠️
Use this if you want to manage Node.js directly or use an external database (like MongoDB Atlas).

### Prerequisites
- Node.js (v18+)
- MongoDB (Installed locally or URI from Atlas)
- PM2 (Process Manager): `npm install -g pm2`

### Steps
1.  **Clone & Install**:
    ```bash
    git clone https://github.com/Srikarsanka/ubhava.git
    cd ubhava
    npm install
    ```
2.  **Configure Environment**:
    Create `.env` file:
    ```bash
    cp .env.example .env
    nano .env
    ```
    Update `MONGO_URI` and `JWT_SECRET`.

3.  **Build/Prepare** (if needed, currently just plain JS):
    ```bash
    # No build step needed for this project structure
    ```

4.  **Start with PM2**:
    ```bash
    pm2 start server/index.js --name "ubhava-app"
    pm2 save
    pm2 startup
    ```

5.  **Access**: App is running on port 3000. Use Nginx as a reverse proxy to serve on port 80/443 (see Nginx guides).

---

## ⚠️ Important Production Notes
1.  **Change Secrets**: Never use default secrets in production.
2.  **HTTPS**: Use Nginx + Certbot (Let's Encrypt) to get free SSL certificates.
3.  **Database**: If using Option 1, data is stored in a Docker volume. If you delete the volume, data is lost. Backups recommended.
