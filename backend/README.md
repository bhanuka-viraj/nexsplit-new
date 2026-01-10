# NexSplit Backend API

Backend API for NexSplit - a modern expense splitting and group management application.

## 🚀 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Google OAuth 2.0
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, bcryptjs

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/nexsplit
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexsplit
   
   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:5000` with hot-reload enabled.

### Production Mode
```bash
npm run build
npm start
```

### Other Scripts
```bash
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── group.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── dashboard.controller.ts
│   │   └── debt.controller.ts
│   ├── models/          # Mongoose schemas
│   │   ├── user.model.ts
│   │   ├── group.model.ts
│   │   └── transaction.model.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── group.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── debt.routes.ts
│   ├── services/        # Business logic
│   │   ├── group.service.ts
│   │   ├── transaction.service.ts
│   │   └── calculation.service.ts
│   ├── middleware/      # Custom middleware
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/           # Utility functions
│   │   ├── ApiResponse.ts
│   │   ├── AppError.ts
│   │   └── catchAsync.ts
│   ├── config/          # Configuration files
│   │   └── database.ts
│   ├── types/           # TypeScript types
│   └── server.ts        # Application entry point
├── logs/                # Application logs
├── .env                 # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /signin` - Login with email/password
- `POST /google` - Google OAuth login
- `POST /logout` - Logout user

### Users (`/api/users`)
- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile
- `PUT /me/preferences` - Update user preferences (currency, monthly limit)

### Groups (`/api/groups`)
- `GET /` - Get all user's groups
- `POST /` - Create new group
- `GET /:id` - Get group details with transactions
- `GET /:id/summary` - Get group financial summary
- `PUT /:id` - Update group
- `DELETE /:id` - Delete group

### Transactions (`/api/transactions`)
- `POST /` - Create new transaction (expense/income/settlement)
- `PUT /:id` - Update transaction
- `DELETE /:id` - Delete transaction

### Dashboard (`/api/dashboard`)
- `GET /summary` - Get user dashboard summary (recent activity, stats)

### Debts (`/api/debts`)
- `GET /` - Get all user debts
- `GET /settlements` - Get settlement history

## 📊 API Documentation

Swagger documentation is available at:
```
http://localhost:5000/api-docs
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are issued upon successful login/signup and expire after 7 days (configurable).

## 💾 Database Schema

### User
- Personal information (name, email, avatar)
- Preferences (currency, monthly limit)
- Google OAuth data

### Group
- Group details (name, emoji/image, currency)
- Members (references to Users)
- Timestamps

### Transaction
- Type: EXPENSE, INCOME, or SETTLEMENT
- Amount and description
- Payer (paidByUserId)
- Split details (for expenses)
  - Split type: EQUAL, EXACT, or PERCENTAGE
  - Per-user amounts/percentages
- Group reference
- Date

## 🧮 Calculation Logic

The `CalculationService` handles:
- **Group Summary**: Calculates who paid what and who owes what
- **Settlements**: Generates optimal settlement suggestions
- **Debt Tracking**: Tracks all debts and settlement history

### Settlement Algorithm
1. Calculate net balance for each member (paid - owed)
2. Sort creditors (positive balance) and debtors (negative balance)
3. Match largest debtor with largest creditor
4. Repeat until all debts settled

## 🛡️ Security Features

- **Helmet**: HTTP headers security
- **CORS**: Cross-origin resource sharing
- **bcryptjs**: Password hashing
- **JWT**: Secure token-based authentication
- **Input Validation**: Zod schema validation
- **Error Handling**: Centralized error middleware

## 🐛 Debugging

Enable detailed logging by setting in `.env`:
```env
NODE_ENV=development
```

Logs are written to:
- Console (development)
- `logs/` directory (production)

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Manual Deployment
1. Build the project: `npm run build`
2. Set environment variables on your hosting platform
3. Start with: `npm start`

## ⚠️ Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running locally OR
- Check your `MONGODB_URI` connection string
- Whitelist your IP in MongoDB Atlas

### Port Already in Use
- Change `PORT` in `.env` file
- Kill the process using port 5000

### Google OAuth Not Working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Add authorized redirect URIs in Google Console

## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:5173 |

## 📄 License

ISC

## 👨‍💻 Developer Notes

- Always validate input data using Zod schemas
- Use `catchAsync` wrapper for async route handlers
- Follow RESTful naming conventions
- Add Swagger documentation for new endpoints
- Write business logic in services, not controllers
