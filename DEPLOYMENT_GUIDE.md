# SmartCart Production Deployment Guide

Follow these guidelines to compile, build, configure, and launch the **SmartCart – Online Shopping Cart System** in a production environment.

---

## 1. Production Build & Compilation

To build both the frontend static assets (bundled with Vite) and compile the backend TypeScript scripts into pure JavaScript (`dist/` directory):

Run the unified build command from the project root:
```bash
npm run build
```

This performs the following actions:
1. Bundles the React application into the `/dist` directory.
2. Compiles backend TypeScript files into the `/backend/dist` directory.

---

## 2. Environment Configurations

Create a `.env` file inside the `backend/` directory to configure credentials, ports, and security constants:

```ini
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartcart?retryWrites=true&w=majority

# JWT Token Secret
JWT_SECRET=super_secure_random_production_secret_key_987654321
```

---

## 3. Node.js Process Management (PM2)

In production, run the backend Express server using a process manager like **PM2** to ensure it remains running continuously, auto-restarts on crashes, and boots on server restart.

### Install PM2 Globally:
```bash
npm install -g pm2
```

### Start the Server with PM2:
From the `backend/` directory, start the compiled server entry point:
```bash
pm2 start dist/server.js --name "smartcart-api"
```

### Configure Startup Script:
```bash
pm2 startup
pm2 save
```

---

## 4. Serving the Frontend & Reverse Proxy (Nginx)

In production, it is highly recommended to use **Nginx** to serve the static frontend bundle files and act as a reverse proxy routing API requests from `/api` to the running Express app on port `5000`.

### Sample Nginx Configuration (`/etc/nginx/sites-available/smartcart`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve Vite compiled React static assets
    location / {
        root /Users/uvs/Project/Shoping Cart/Shopping-Cart-Project/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy api requests to Express server running on port 5000
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/smartcart /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## 5. Security Checklist

Before launching to public users, verify that the following secure protocols are active:

1. **Enable HTTPS / SSL**: Configure SSL certificates (e.g. via Let's Encrypt / Certbot) on Nginx to protect passwords and transit JWT tokens securely.
2. **Disable Cors Origins**: In `backend/server.ts`, replace the wildcard or localhost CORS settings with your exact domain name.
3. **Change Default Secret Keys**: Ensure `JWT_SECRET` is set to a long, cryptographically secure random string.
4. **Secure Headers**: Install `helmet` middleware on Express to add standard HTTP response headers for XSS protection.
5. **Passkey Origins**: Update `ORIGIN` and `RP_ID` in `backend/routes/auth.ts` to your production domain name (e.g., `RP_ID = 'yourdomain.com'` and `ORIGIN = 'https://yourdomain.com'`).
