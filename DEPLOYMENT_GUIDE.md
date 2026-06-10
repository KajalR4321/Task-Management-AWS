# TaskFlow — Deployment Guide
## Serverless Task Management App | Next.js + AWS Lambda + DynamoDB + S3

---

## Architecture Overview

```
Browser → AWS Amplify (Next.js)
              ↓
         API Gateway
              ↓
         Lambda Functions
              ↓
         DynamoDB (Single Table)  +  S3 (Attachments)
```

---

## Step 1: AWS Setup Prerequisites

1. Create an AWS account at https://aws.amazon.com
2. Install AWS CLI: `npm install -g aws-cdk` or download from AWS
3. Configure credentials:
```bash
aws configure
# Enter: AWS Access Key, Secret Key, Region (ap-south-1 for India)
```

---

## Step 2: Create DynamoDB Table

In AWS Console → DynamoDB → Create Table:
- Table name: `taskflow-table`
- Partition key: `PK` (String)
- Sort key: `SK` (String)
- Billing: On-demand (Pay per request) ← no fixed cost!

OR using CLI:
```bash
aws dynamodb create-table \
  --table-name taskflow-table \
  --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
  --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

### DynamoDB Single-Table Design:
| PK | SK | Data |
|---|---|---|
| USER#userId | TASK#taskId | title, status, priority, dueDate... |
| USER#userId | PROJECT#projectId | name, color, createdAt |

---

## Step 3: Create S3 Bucket for Attachments

In AWS Console → S3 → Create Bucket:
- Name: `taskflow-attachments-YOUR_ACCOUNT_ID`
- Region: same as DynamoDB (ap-south-1)
- Uncheck "Block all public access" for attachments bucket

Add CORS policy (Permissions tab):
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": ["*"],
  "MaxAgeSeconds": 3000
}]
```

---

## Step 4: Deploy Lambda Functions

For each function in `backend/lambdas/`:

### Install dependencies first:
```bash
cd backend/lambdas/createTask && npm install
cd backend/lambdas/getTasks && npm install
# ... repeat for all functions
```

### Create Lambda in AWS Console:
1. Go to Lambda → Create Function → Author from scratch
2. Name: `taskflow-getTasks`, Runtime: Node.js 20.x
3. Paste the code from `backend/lambdas/getTasks/index.js`
4. Set Environment Variables:
   - `TABLE_NAME` = `taskflow-table`
   - `BUCKET_NAME` = `taskflow-attachments-YOUR_ACCOUNT_ID`

### IAM Permissions for Lambda:
Add these policies to the Lambda execution role:
- `AmazonDynamoDBFullAccess` (or scoped version)
- `AmazonS3FullAccess` (or scoped to your bucket)

### Repeat for all 7 functions:
- `taskflow-getTasks`
- `taskflow-createTask`
- `taskflow-updateTask`
- `taskflow-deleteTask`
- `taskflow-getProjects`
- `taskflow-createProject`
- `taskflow-getUploadUrl`

---

## Step 5: Create API Gateway

1. AWS Console → API Gateway → Create API → REST API
2. Create resources and methods:

```
/tasks
  GET  → taskflow-getTasks Lambda
  POST → taskflow-createTask Lambda
/tasks/{taskId}
  PUT    → taskflow-updateTask Lambda
  DELETE → taskflow-deleteTask Lambda
/projects
  GET  → taskflow-getProjects Lambda
  POST → taskflow-createProject Lambda
/upload-url
  POST → taskflow-getUploadUrl Lambda
```

3. Enable CORS on each resource
4. Deploy API → Stage name: `prod`
5. Copy the Invoke URL (looks like: `https://abc123.execute-api.ap-south-1.amazonaws.com/prod`)

---

## Step 6: Configure Frontend

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://YOUR_API_GATEWAY_URL/prod
```

Test locally:
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

---

## Step 7: Deploy to AWS Amplify

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "TaskFlow - Serverless Task Manager"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

2. AWS Console → Amplify → New App → Host web app
3. Connect your GitHub repo
4. Build settings (auto-detected for Next.js):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend && npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```
5. Add environment variable: `NEXT_PUBLIC_API_URL` = your API Gateway URL
6. Deploy! Amplify gives you a URL like: `https://main.d1234abcd.amplifyapp.com`

---

## Speed Optimizations Implemented

| Optimization | Implementation |
|---|---|
| Static Generation | Next.js App Router with server components |
| CDN | CloudFront via Amplify (automatic) |
| Optimistic Updates | UI updates instantly before API confirms |
| DynamoDB Single Table | Minimal API calls per query |
| Image optimization | Next.js `<Image>` component |
| Font preloading | `<link rel="preconnect">` in layout |
| Code splitting | Automatic with Next.js |

---

## Submission Checklist

- [ ] Live URL from AWS Amplify
- [ ] All Lambda functions deployed
- [ ] DynamoDB table created
- [ ] S3 bucket with CORS configured
- [ ] API Gateway deployed
- [ ] GitHub repo with complete source code
- [ ] This README included

---

## Email Subject Line
`#SDTask – web/app development`

## Send to
`cspltask@gmail.com`
