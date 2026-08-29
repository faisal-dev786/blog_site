# Netlify Deployment Steps for This Project

This project is a Node.js + Express backend that is deployed on Netlify as a serverless function.

The main deployment files are:

- app.js
- server.js
- config/db.js
- controller/authController.js
- routes/authRoutes.js
- netlify/functions/api.js
- netlify.toml
- .env

---

## 1. What each file does

### 1) app.js
This is the main Express app.

It does these things:

- enables CORS
- reads JSON from incoming requests
- creates the /api/health route
- mounts auth routes at /api/auth
- mounts blog routes at /api/blogs

This file is the heart of the app and is used by the Netlify function.

### 2) server.js
This file is used for local development.

It does this:

- loads environment variables
- connects to MongoDB
- starts the app on a local port

Example:

```js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 4000;

await connectDB();

app.listen(port, () => {
    console.log(`server is runnig on port ${port}`);
});
```

This file is not the production entry for Netlify.

### 3) config/db.js
This file connects the app to MongoDB using Mongoose.

It uses:

```js
await mongoose.connect(process.env.MONGO_URI);
```

This is important because Netlify needs the MONGO_URI environment variable.

If MongoDB is not connected, the API will fail.

### 4) controller/authController.js
This file contains all authentication logic.

It includes:

- registerUser
- loginUser
- resetPassword
- logOutUser
- updateUsername

The login logic expects:

```json
{
  "useremail": "fadi@yahoo.com",
  "password": "123456"
}
```

This route also creates a JWT token using:

```js
process.env.JWT_SECRET
```

### 5) routes/authRoutes.js
This file defines the auth API routes.

Example routes:

```js
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/logout', logOutUser);
authRouter.put('/update-name', authMiddleware, updateUsername);
```

So the backend API is available at:

- /api/auth/register
- /api/auth/login
- /api/auth/reset-password
- /api/auth/logout
- /api/auth/update-name

### 6) netlify/functions/api.js
This is the most important file for Netlify deployment.

It does this:

- loads environment variables
- imports the Express app
- connects to MongoDB
- converts Express app to serverless function
- exports Netlify handler

Example:

```js
import dotenv from "dotenv";
dotenv.config();

import serverless from "serverless-http";
import app from "../../app.js";
import { connectDB } from "../../config/db.js";

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return serverlessHandler(event, context);
};
```

This is the file Netlify runs when you hit /api/*.

### 7) netlify.toml
This file tells Netlify how to deploy the project.

Important config:

```toml
[build]
  command = "npm install"
  publish = "public"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200
```

This means:

- install dependencies
- deploy static files from public
- use functions from netlify/functions
- send all /api requests to the serverless function

### 8) .env
This file is for local development.

It contains values like:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
PORT=5000
JWT_SECRET=your_secret_key
```

But for Netlify, you must add the same values in Netlify Dashboard > Site Configuration > Environment Variables.

Do not depend only on .env in production.

---

## 2. Steps to deploy on Netlify

### Step 1: Prepare the project

Open terminal in the project root and run:

```bash
npm install
```

Then test locally:

```bash
npm start
```

If it works locally, the project is ready.

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your_github_repo_url>
git push -u origin main
```

### Step 3: Open Netlify

1. Go to https://app.netlify.com
2. Log in
3. Click Add new project
4. Choose Import an existing project
5. Select your GitHub repository

### Step 4: Configure deployment settings

In Netlify, set:

- Build command: `npm install`
- Publish directory: `public`
- Functions directory: `netlify/functions`

If the project has netlify.toml, Netlify will usually read it automatically.

### Step 5: Add environment variables

Go to Netlify Dashboard:

- Site configuration
- Environment variables

Add these:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Example:

```env
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/blogdb
JWT_SECRET=myverystrongsecretkey
PORT=5000
```

This is required for the app to run in production.

### Step 6: Deploy the site

Click Deploy site.

After a while, Netlify gives a public URL such as:

```text
https://your-project-name.netlify.app
```

### Step 7: Test the deployed API

Check health route:

```bash
curl https://your-project-name.netlify.app/api/health
```

Expected:

```json
{ "message": "API is running" }
```

Then test login:

```bash
curl --location 'https://your-project-name.netlify.app/api/auth/login' \
  --header 'Content-Type: application/json' \
  --data '{
    "useremail":"fadi@yahoo.com",
    "password":"123456"
  }'
```

---

## 3. Common Netlify problems and fixes

### Problem: 502 error
Possible reasons:

- MONGO_URI is missing
- JWT_SECRET is missing
- MongoDB connection is invalid
- Netlify function crashed

Fix:

- set missing environment variables in Netlify
- verify MongoDB connection string
- redeploy the site

### Problem: API routes not working
Check [netlify.toml](netlify.toml) and confirm the redirect is present:

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200
```

### Problem: login route not working
The request body must be:

```json
{
  "useremail": "fadi@yahoo.com",
  "password": "123456"
}
```

Also make sure the user exists in MongoDB.

---

## 4. Final checklist

Before finishing, confirm:

- [ ] GitHub repo is connected to Netlify
- [ ] npm install works locally
- [ ] MongoDB Atlas is ready
- [ ] MONGO_URI is set in Netlify
- [ ] JWT_SECRET is set in Netlify
- [ ] netlify.toml is correct
- [ ] netlify/functions/api.js is present
- [ ] API health route works
- [ ] Login route works

---

## 5. Important note for this project

The biggest deployment issue for this project is usually not the code itself, but missing environment variables.

This project depends on:

- MongoDB connection string: `MONGO_URI`
- JWT secret: `JWT_SECRET`

Without these in Netlify, the app will fail when it tries to connect to MongoDB or sign a token.

---

If you want, I can also create a shorter version of this document with only the exact commands and a simple checklist.
