# AlphaLens Deployment Guide (Render + Vercel)

This guide provides instructions on how to deploy the AlphaLens application. We deploy the **Backend (Express/Node.js)** to **Render** and the **Frontend (Angular)** to **Vercel**.

---

## Step 1: Push Your Code to GitHub

If you haven't already, push your codebase to a GitHub repository:

1. Initialize a Git repository in the project root:
   ```bash
   git init
   ```
2. Stage and commit your files:
   ```bash
   git add .
   git commit -m "Configure project for Render and Vercel deployment"
   ```
3. Create a new repository on [GitHub](https://github.com) and push your repository to it.

---

## Step 2: Deploy the Backend to Render

1. Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `alphalens-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Select the region closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In the **Environment Variables** section, add the following variables:
   - `PORT`: `5000` (Optional, Render handles port mapping, but setting it explicitly is good)
   - `GROQ_API_KEY`: `your_groq_api_key`
   - `NEWS_API_KEY`: `your_news_api_key`
   - `MONGODB_URI`: `your_mongodb_connection_string` (If left empty, the backend will gracefully fall back to an in-memory database)
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://alphalens-backend.onrender.com`).

---

## Step 3: Deploy the Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Configure the Project settings:
   - **Framework Preset**: `Angular`
   - **Root Directory**: Click **Edit** and select `client`
   - **Build and Development Settings**:
     - Keep the default settings (Build Command should auto-detect to `npm run build` or `ng build`)
5. In the **Environment Variables** section, add the following variable:
   - **Key**: `API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api` (Replace with your actual Render URL, making sure to append `/api` at the end!)
6. Click **Deploy**.
7. Once deployment is complete, Vercel will provide your live frontend URL!

---

## Step 4: Verify the Deployment

1. Visit your Vercel frontend URL.
2. Search for a stock ticker (e.g., `AAPL`, `MSFT`) to verify the AI Investment Research reports are generated.
3. Check the history and chat pages to ensure full functionality.
