# SmartCart API Documentation

SmartCart is built on a RESTful backend API structure running on `http://localhost:5000` and proxied from the React app at `/api`. All JSON bodies are parsed automatically, and responses are returned in JSON formats.

---

## 1. Authentication Endpoints (`/api/auth`)

Security features like JWT verification and request rate-limiting (max 30 attempts per 15 minutes) are enforced.

### POST `/register`
Creates a new customer or admin account.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "secretpassword",
    "confirmPassword": "secretpassword"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "603d4b53501...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "customer"
    }
  }
  ```

### POST `/login`
Logs in a user with email and password.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "secretpassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "603d4b53501...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "customer"
    }
  }
  ```

### POST `/oauth-login`
Handles simulated Google/Facebook OAuth token registrations and sign-ins.
- **Request Body**:
  ```json
  {
    "email": "googleuser@example.com",
    "name": "Google User",
    "provider": "google"
  }
  ```
- **Response (200 OK)**: Returns JWT token and User object.

### POST `/passkey/register-options`
Generates WebAuthn registration parameters to send to the browser credential API.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "name": "John Doe"
  }
  ```
- **Response (200 OK)**: Standard SimpleWebAuthn options response containing challenge and Relying Party parameters.

### POST `/passkey/register-verify`
Validates browser biometric registration output and registers the credential in the database.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "credential": { ... } // browser WebAuthn credential object
  }
  ```
- **Response (200 OK)**: `{ "verified": true, "token": "...", "user": { ... } }`

### POST `/passkey/login-options`
Generates WebAuthn authentication options mapping to a registered passkey.
- **Request Body**: `{ "email": "john@example.com" }`
- **Response (200 OK)**: Standard SimpleWebAuthn auth options configuration.

### POST `/passkey/login-verify`
Validates browser biometric signature and issues a JWT token.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "credential": { ... }
  }
  ```
- **Response (200 OK)**: `{ "verified": true, "token": "...", "user": { ... } }`

---

## 2. Categories Endpoints (`/api/categories`)

### GET `/`
Lists all available product departments.
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "603c12a...",
      "name": "Vegetables",
      "image": "https://..."
    }
  ]
  ```

### POST `/`
Adds a category. **Requires Admin JWT token**.
- **Request Header**: `Authorization: Bearer <token>`
- **Request Body**: `{ "name": "Snacks", "image": "https://..." }`

### PUT `/:id`
Updates category parameters. **Requires Admin JWT token**.

### DELETE `/:id`
Removes category. **Requires Admin JWT token**.

---

## 3. Products Endpoints (`/api/products`)

### GET `/`
List products with optional search parameters.
- **Query Parameters**:
  - `search`: filters item name/description (regex, case-insensitive)
  - `category`: filters category name
  - `minPrice`: minimum unit cost
  - `maxPrice`: maximum unit cost
  - `rating`: minimum star review (>= value)
  - `sortBy`: sorting choice (`newest`, `priceAsc`, `priceDesc`, `popular`)
- **Response (200 OK)**: Array of matching product documents.

### GET `/:id`
Retrieves detailed product profile.
- **Response (200 OK)**: Single product object.

### POST `/`
Creates catalog item. **Requires Admin JWT token**.
- **Request Body**:
  ```json
  {
    "name": "Fresh Avocados",
    "description": "Premium organic avocados",
    "price": 3.99,
    "category": "Fruits",
    "image": "https://...",
    "stock": 100
  }
  ```

### PUT `/:id`
Updates catalog item details. **Requires Admin JWT token**.

### DELETE `/:id`
Deletes catalog item. **Requires Admin JWT token**.

---

## 4. Shopping Cart Endpoints (`/api/cart`)

All requests require user authorization header.

### GET `/`
Fetches active user's cart populated with product details.
- **Response (200 OK)**:
  ```json
  {
    "_id": "603f...",
    "userId": "603d...",
    "products": [
      {
        "productId": {
          "_id": "603e...",
          "name": "Organic Milk",
          "price": 3.79,
          "image": "https://...",
          "stock": 50
        },
        "quantity": 2
      }
    ]
  }
  ```

### POST `/`
Saves full cart array in database.
- **Request Body**:
  ```json
  {
    "products": [
      { "productId": "603e...", "quantity": 3 }
    ]
  }
  ```

### DELETE `/`
Clears items from the user's active cart.

---

## 5. Orders Endpoints (`/api/orders`)

Require user authorization.

### GET `/stats`
Returns total orders, users, items, and revenue. **Requires Admin JWT token**.
- **Response (200 OK)**:
  ```json
  {
    "totalProducts": 18,
    "totalCategories": 8,
    "totalUsers": 2,
    "totalOrders": 1,
    "totalRevenue": 24.50
  }
  ```

### POST `/`
Validates inventory availability, decrements product stock, stores checkout details, and clears user's cart.
- **Request Body**:
  ```json
  {
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "address": "456 Main St, San Francisco, CA"
    },
    "products": [
      {
        "productId": "603e...",
        "name": "Organic Milk",
        "price": 3.79,
        "quantity": 2,
        "image": "https://..."
      }
    ],
    "subtotal": 7.58,
    "tax": 0.61,
    "deliveryFee": 5.00,
    "grandTotal": 13.19
  }
  ```
- **Response (201 Created)**: Confirmed Order object.

### GET `/`
Returns user order history. Admins receive all registered orders.
