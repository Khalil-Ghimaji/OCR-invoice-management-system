# Project Setup Instructions

This guide outlines the steps to set up and run the project, including both the frontend and backend components.

## Frontend Setup

1. **Create the Frontend Environment File**  
   In the `/frontend` directory, create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase
   NEXTAUTH_SECRET=
   FASTAPI_OCR_URL=http://localhost:8000
   FASTAPI_OCR_TOKEN=
   ```

2. **Navigate to the Frontend Directory**  
   ```bash
   cd /frontend
   ```

3. **Install Dependencies**  
   ```bash
   pnpm install
   ```

4. **Generate Prisma Client**  
   ```bash
   npx prisma generate
   ```

5. **Create the Database**  
   Ensure your PostgreSQL database is set up and accessible via the `DATABASE_URL` specified in the `.env` file. Replace `user`, `password`, and `mydatabase` in the `DATABASE_URL` with your actual PostgreSQL credentials and database name.

6. **Run Prisma Migrations**  
   Apply migrations to the database, replacing `"migration_name"` with a descriptive name for the migration:
   ```bash
   npx prisma migrate dev --name "migration_name"
   ```

7. **Seed the Database**  
   Run the seed script to populate the database:
   ```bash
   npx tsx prisma/seed.ts
   ```

8. **Run the Frontend**  
   For development, use:
   ```bash
   pnpm run dev
   ```
   For production, build and start the application:
   ```bash
   pnpm run build && pnpm start
   ```

## Backend Setup

1. **Create the Backend Environment File**  
   In the `/backend` directory, create a `.env` file with the following variables:
   ```
   GROQ_API_KEY=
   FRONTEND_URL=http://localhost:3000
   BACKEND_ACCESS_TOKEN=
   ```
   **Note**: Ensure the `FASTAPI_OCR_TOKEN` in the frontend `.env` matches the `BACKEND_ACCESS_TOKEN` in the backend `.env`.

2. **Navigate to the Backend Directory**  
   ```bash
   cd ../backend
   ```

3. **Install Dependencies**  
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Backend**  
   Run the main application:
   ```bash
   python main.py
   ```
