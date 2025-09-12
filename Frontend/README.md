# OCR Invoice Service

## Setup Instructions

### Database Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Generate Prisma Client:**
   \`\`\`bash
   npm run db:generate
   \`\`\`

3. **Setup your database:**
   \`\`\`bash
   # For development with SQLite
   npm run db:push
   
   # Or for production with migrations
   npm run db:migrate
   \`\`\`

4. **Seed the database:**
   \`\`\`bash
   npm run db:seed
   \`\`\`

### Environment Variables

Create a `.env` file based on `.env.example`:

\`\`\`env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_SECRET="your-secret-key"
FASTAPI_OCR_URL="http://localhost:8000"
FASTAPI_OCR_TOKEN="your-ocr-api-token"
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

## Features

- 🔐 JWT Authentication with role-based access
- 📊 Analytics dashboard with charts
- 📄 Invoice OCR processing
- 💳 Subscription management
- 👥 Admin panel
- 🔒 Security middleware with rate limiting

## Tech Stack

- Next.js 15 with App Router
- Prisma ORM
- TypeScript
- Tailwind CSS
- Recharts for analytics
- Radix UI components
