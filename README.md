# TaskFlow — Serverless Task Management App

> Built for Cybernetics Software Pvt. Ltd. — Option B: Web App Development

## Live Demo
🔗 [Deploy link here after AWS Amplify setup]

## Tech Stack
- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Backend**: AWS Lambda (Node.js 20) + API Gateway
- **Database**: AWS DynamoDB (Single-table design)
- **Storage**: AWS S3 (file attachments with pre-signed URLs)
- **Hosting**: AWS Amplify + CloudFront CDN

## Features
- ✅ Kanban board with drag-and-drop (3 columns: To Do / In Progress / Done)
- ✅ List view with sorting and filtering
- ✅ Dashboard with progress stats
- ✅ Create, edit, delete tasks
- ✅ Task priorities (High / Medium / Low)
- ✅ Due dates with overdue detection
- ✅ Project organization
- ✅ File attachments via S3
- ✅ Optimistic UI updates (instant feel)
- ✅ Demo mode (works without AWS configured)

## Project Structure
```
taskflow/
├── frontend/          ← Next.js app (deploy to Amplify)
│   ├── app/           ← Pages (App Router)
│   ├── components/    ← UI components
│   └── lib/api.ts     ← API client
├── backend/
│   └── lambdas/       ← 7 Lambda functions
│       ├── getTasks/
│       ├── createTask/
│       ├── updateTask/
│       ├── deleteTask/
│       ├── getProjects/
│       ├── createProject/
│       └── getUploadUrl/
├── infrastructure/
│   └── cloudformation.yaml
└── DEPLOYMENT_GUIDE.md  ← Step-by-step deployment instructions
```

## Quick Start (Local)
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000 (runs in demo mode)
```

## Deployment
See `DEPLOYMENT_GUIDE.md` for complete step-by-step AWS deployment instructions.

## Submission
Email: cspltask@gmail.com
Subject: #SDTask – web/app development
