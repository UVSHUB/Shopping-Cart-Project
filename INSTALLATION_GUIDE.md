# SmartCart Installation & Setup Guide

Welcome to the **SmartCart – Online Shopping Cart System** installation guide! Follow these instructions to set up the development environment, configure the database, install packages, and boot the servers.

---

## Prerequisites

Before starting, ensure you have the following packages installed on your local computer:

1. **Node.js**: Version `v20.0.0` or higher (recommended: LTS)
2. **MongoDB Community Server**: Running locally on the standard port `27017`

---

## Step 1: Start MongoDB Service

Make sure your MongoDB server is up and running. 

### On macOS (Homebrew):
```bash
brew services start mongodb-community
```

### On Windows (Command Prompt as Admin):
```cmd
net start MongoDB
```

### On Linux (systemd):
```bash
sudo systemctl start mongod
```

To verify MongoDB is running, run `mongosh` or check running processes:
```bash
pgrep mongod
```

---

## Step 2: Clone & Directory Overview

Navigate to the project directory `/Users/uvs/Project/Shoping Cart/Shopping-Cart-Project` which contains the complete source code structured as follows:

```
├── package.json          # Root scripts and build dependencies
├── vite.config.ts        # Vite + React + Tailwind v4 + Proxy configurations
├── index.html            # Web app entry markup & FOUC theme script
├── src/                  # React + TypeScript client sources
│   ├── main.tsx          # Render React root element
│   ├── App.tsx           # Route controllers & providers
│   ├── index.css         # Styling, glassmorphic styles, scrollbars, dialogs
│   ├── context/          # Shared contexts (AuthContext, CartContext)
│   ├── components/       # Reusable views (Navbar, Footer, Hero, ProductCard)
│   └── pages/            # View pages (Home, ProductList, ProductDetails, Cart, etc.)
└── backend/              # Node.js + Express + Mongoose server
    ├── package.json      # Express dependencies
    ├── tsconfig.json     # Node TypeScript compiler choices
    ├── server.ts         # Main server entry & middleware settings
    ├── seed.ts           # Automatic database catalog seeder
    ├── models/           # Mongoose schemas (User, Product, Category, etc.)
    ├── middleware/       # JWT and authorization helpers
    └── routes/           # Endpoint handlers (auth, products, cart, etc.)
```

---

## Step 3: Install Dependencies

From the project root, you can install the dependencies for both the frontend client and the backend server with a single helper command:

```bash
# Installs root, client, and backend packages
npm install && cd backend && npm install && cd ..
```

---

## Step 4: Run Development Server

To start both the backend server (on `http://localhost:5000`) and the Vite frontend server (on `http://localhost:5173`) concurrently, run:

```bash
npm run dev
```

You should see output indicating:
1. Concurrently has launched both processes.
2. MongoDB has connected successfully.
3. The catalog seeder has run (if the DB was empty, it will auto-populate the 8 categories and 16+ sample products).
4. The client server is listening on `http://localhost:5173`.

Open `http://localhost:5173` in your browser.

---

## Testing User Accounts

You can register a new account on the UI or use these credentials to test:

### Administrator Test Account:
Register an email ending in `@smartcart.admin` (e.g. `admin@smartcart.admin`) with any password. The backend automatically grants the `admin` role to emails ending with this domain for testing purposes.
This admin account will have full access to:
* The Admin Dashboard Portal at `http://localhost:5173/admin`
* Category additions, edits, and deletions
* Product additions, edits, and deletions
