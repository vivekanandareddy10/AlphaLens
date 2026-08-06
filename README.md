# AlphaLens – AI Investment Research Agent

## Overview

AlphaLens is an AI-powered investment research platform that helps users analyze publicly traded companies using a multi-agent AI workflow built with LangGraph.

Users simply enter a company name or stock ticker. The application retrieves financial information, analyzes recent news, evaluates company fundamentals, and generates a **Buy**, **Hold**, or **Sell** recommendation along with an AI-generated explanation and confidence score.

The objective of the project is to demonstrate how multiple AI agents can collaborate to automate investment research in a structured and explainable manner.

---

# Technology Stack

### Frontend
- React.js
- TypeScript
- Vite

### Backend
- Node.js
- Express.js
- LangGraph
- LangChain

### Database
- MongoDB Atlas

### APIs Used
- Yahoo Finance API
- News API
- Groq LLM API

---

# Project Structure

```
AlphaLens
│
├── client/                 # React Frontend
├── server/                 # Node.js Backend
├── docs/                   # Project Documentation
├── README.md
├── development_notes.md
├── architecture_decisions.md
└── prompt_history.md
```

---

# How to Run

## Prerequisites

Install the following before running the project:

- Node.js (v18 or above)
- MongoDB Atlas Account
- Groq API Key
- News API Key

---

## Backend Setup

Navigate to the backend folder.

```bash
cd server
```

Install all dependencies.

```bash
npm install
```

### Environment Variables

Create a file named **`.env`** inside the **server** folder.

Add the following variables:


### env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

GROQ_API_KEY=your_groq_api_key

NEWS_API_KEY=your_news_api_key
```

---

## Getting the Required Credentials

### MongoDB Atlas

1. Create a free MongoDB Atlas account.
2. Create a cluster.
3. Create a Database User.
4. Add your current IP under **Network Access**.
5. Open **Connect → Drivers**.
6. Copy the generated connection string into **MONGODB_URI**.

---

### Groq API

1. Create an account at Groq Console.
2. Navigate to **API Keys**.
3. Generate a new API key.
4. Paste it into **GROQ_API_KEY**.

---

### News API

1. Create a free account at NewsAPI.
2. Generate an API key.
3. Paste it into **NEWS_API_KEY**.

---

## Start the Backend

Run:

```bash
npm run dev
```

If the configuration is correct, the terminal should display:

```
Server running on port 5000
MongoDB Connected
```

---

## Frontend Setup

Open another terminal.

Navigate to the frontend folder.

```bash
cd client
```

Install dependencies.

```bash
npm install
```

Start the frontend.

```bash
npm run dev
```

Open the application in your browser.

```
http://localhost:5173
```

---

# How It Works

The application follows a LangGraph multi-agent workflow.

```
User Input
      │
      ▼
Financial Data Agent
      │
      ▼
News Analysis Agent
      │
      ▼
Financial Analysis Agent
      │
      ▼
Decision Agent
      │
      ▼
Investment Report
```

### Financial Data Agent

- Retrieves company profile
- Fetches financial statements
- Retrieves stock information
- Calculates financial metrics

### News Analysis Agent

- Collects recent news articles
- Performs sentiment analysis
- Identifies important market events

### Financial Analysis Agent

- Revenue Growth
- Profitability
- Cash Flow
- Debt Analysis
- Earnings Analysis

### Decision Agent

Combines outputs from all previous agents and generates:

- Buy / Hold / Sell Recommendation
- Confidence Score
- AI-generated Explanation

---

# Key Decisions & Trade-offs

### Design Decisions

- LangGraph was selected to create a modular multi-agent workflow.
- React was used to provide a responsive user interface.
- MongoDB stores reports and search history.
- Node.js and Express handle backend APIs.

### Trade-offs

Due to the assignment timeline, the following features were intentionally left out:

- User Authentication
- Portfolio Tracking
- Technical Indicators
- Real-time Stock Streaming
- PDF Report Export

---

# Example Runs

### Apple (AAPL)

**Recommendation:** BUY (91%)

Reason:
- Strong revenue growth
- Healthy cash reserves
- Positive recent news

### Microsoft (MSFT)

**Recommendation:** BUY (89%)

Reason:
- Strong cloud business
- Stable earnings
- Low financial risk

### Tesla (TSLA)

**Recommendation:** HOLD (76%)

Reason:
- High valuation
- Mixed market sentiment
- Strong innovation

---

# Future Improvements

- Portfolio Management
- Company Comparison Dashboard
- Real-time Market Data
- PDF Report Export
- User Authentication
- RAG-based Analysis using Annual Reports

---

# AI Usage

AI tools were used only as a learning and reference resource to understand LangGraph workflows, architecture design, and prompt engineering. The implementation, debugging, testing, integration, and customization of the project were completed by me, and I can explain every part of the project during the interview.

## Author

Lasya Desineni

InsideIIM × AltUni AI Labs Assignment