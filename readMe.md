🧩 Anvaya CRM — Backend API

A complete Lead Management Backend built using Node.js, Express, and MongoDB.
This service powers the Anvaya CRM frontend with APIs for leads, sales agents, comments, and reporting.

🚀 Features
✅ Leads Management

Create, update, delete leads

Assign sales agents

Filter leads by status, tags, source, or agent

Retrieve leads with population of agent details

👥 Sales Agents

Add sales agents

Prevent duplicate emails

Fetch list of all registered agents

💬 Comments on Leads

Add comments to a specific lead

Auto-assign author using lead’s assigned sales agent

Fetch all comments for a lead

📊 Reporting APIs

Leads closed in the last week

Leads currently in pipeline (excluding Closed)


```
🛠 Tech Stack
Layer	Technology
Backend	Node.js, Express.js
Database	MongoDB + Mongoose
Validation & Utils	Mongoose validators, Regex
Environment	dotenv
CORS Support	cors

```
📁 Project Structure

```
.
├── db
│   └── db.connect.js
├── models
│   ├── lead.model.js
│   ├── salesAgent.model.js
│   └── comment.model.js
├── index.js
└── README.md

```

⚙️ Setup Instructions

1. Clone repository

```
git clone <repo-url>
cd anvaya-backend
```

2. Install dependencies

```
npm install
```

3. Configure environment variables

Create a .env file:

```
MONGO_URL=your-mongodb-connection-string
PORT=3000
```

4. Start server

```
node index.js
```

Server runs at:
```
http://localhost:3000
```


📌 API Documentation

🔵 Leads API
Create a Lead

POST /leads
```
{
  "name": "Sharanya",
  "source": "Referral",
  "salesAgent": "671bd799c4f2ec24264e6931",
  "status": "New",
  "tags": ["Marketing", "High"],
  "timeToClose": 3,
  "priority": "High"
}
```

Get All Leads (with filters)

GET /leads

Query Options:

```
| Query      | Description                                      |
| ---------- | ------------------------------------------------ |
| salesAgent | Filter by agent ID                               |
| status     | New, Contacted, Qualified, Proposal Sent, Closed |
| source     | Referral, Website, Cold Call, Social Media       |
| tags       | Comma-separated list                             |
```

🗨 Comments API

Add Comment to Lead

POST /leads/:id/comments

```
{
  "commentText": "Follow-up done."
}
```
