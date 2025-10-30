# Employee Management & Payroll ERP System - Backend

A complete, production-ready Node.js + Express.js backend for an Employee Management & Payroll ERP system with JWT authentication, role-based access control, and MySQL database.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Employee Management**: Complete CRUD operations for employee records
- **Department Management**: Manage organizational departments
- **Attendance Tracking**: Mark and track employee attendance
- **Payroll Management**: Generate and manage employee payroll
- **Role-based Access**: Admin, HR, and Employee roles with appropriate permissions
- **Data Validation**: Comprehensive input validation and error handling
- **Database Relations**: Proper foreign key relationships and associations
- **API Documentation**: Built-in API documentation endpoint

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **CORS**: Cross-origin resource sharing support

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DB_NAME=erp_database
DB_USER=root
DB_PASS=your_mysql_password
DB_HOST=localhost

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

1. Create a MySQL database named `erp_database` (or your preferred name)
2. Update the `.env` file with your database credentials

### 4. Seed Database (Optional)

Run the seed script to create initial data:

```bash
npm run seed
```

This will create:

- Default departments (HR, IT, Finance, Marketing, Operations)
- Admin user (`admin@erp.com` / admin123)
- HR user (`hr@erp.com` / hr123)
- Sample employee users

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL

```link
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint                | Description         | Access  |
| ------ | ----------------------- | ------------------- | ------- |
| POST   | `/auth/register`        | Register new user   | Public  |
| POST   | `/auth/login`           | User login          | Public  |
| GET    | `/auth/profile`         | Get user profile    | Private |
| PUT    | `/auth/profile`         | Update user profile | Private |
| PUT    | `/auth/change-password` | Change password     | Private |

### Employee Management

| Method | Endpoint           | Description         | Access                    |
| ------ | ------------------ | ------------------- | ------------------------- |
| GET    | `/employees`       | Get all employees   | Admin, HR                 |
| GET    | `/employees/stats` | Employee statistics | Admin, HR                 |
| GET    | `/employees/:id`   | Get employee by ID  | Admin, HR, Employee (own) |
| POST   | `/employees`       | Create employee     | Admin, HR                 |
| PUT    | `/employees/:id`   | Update employee     | Admin, HR, Employee (own) |
| DELETE | `/employees/:id`   | Delete employee     | Admin, HR                 |

### Department Management

| Method | Endpoint             | Description           | Access    |
| ------ | -------------------- | --------------------- | --------- |
| GET    | `/departments`       | Get all departments   | Admin, HR |
| GET    | `/departments/stats` | Department statistics | Admin, HR |
| GET    | `/departments/:id`   | Get department by ID  | Admin, HR |
| POST   | `/departments`       | Create department     | Admin, HR |
| PUT    | `/departments/:id`   | Update department     | Admin, HR |
| DELETE | `/departments/:id`   | Delete department     | Admin, HR |

### Attendance Management

| Method | Endpoint                                       | Description            | Access                    |
| ------ | ---------------------------------------------- | ---------------------- | ------------------------- |
| GET    | `/attendance`                                  | Get attendance records | Admin, HR                 |
| GET    | `/attendance/stats`                            | Attendance statistics  | Admin, HR                 |
| GET    | `/attendance/monthly/:employeeId/:month/:year` | Monthly summary        | Admin, HR, Employee (own) |
| POST   | `/attendance`                                  | Mark attendance        | Admin, HR                 |
| PUT    | `/attendance/:id`                              | Update attendance      | Admin, HR                 |

### Payroll Management

| Method | Endpoint                 | Description             | Access                    |
| ------ | ------------------------ | ----------------------- | ------------------------- |
| GET    | `/payroll`               | Get payroll records     | Admin, HR                 |
| GET    | `/payroll/stats`         | Payroll statistics      | Admin, HR                 |
| GET    | `/payroll/:id`           | Get payroll by ID       | Admin, HR, Employee (own) |
| POST   | `/payroll`               | Generate payroll        | Admin, HR                 |
| POST   | `/payroll/bulk`          | Bulk payroll generation | Admin, HR                 |
| PUT    | `/payroll/:id`           | Update payroll          | Admin, HR                 |
| PUT    | `/payroll/:id/mark-paid` | Mark as paid            | Admin, HR                 |

## 🔐 Authentication

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "employee"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@erp.com",
    "password": "admin123"
  }'
```

### Using JWT Token

Include the JWT token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏗️ Project Structure

```structure
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── AuthController.js     # Authentication logic
│   ├── EmployeeController.js # Employee management
│   ├── DepartmentController.js # Department management
│   ├── AttendanceController.js # Attendance tracking
│   └── PayrollController.js  # Payroll management
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validation.js        # Input validation middleware
├── models/
│   ├── User.js              # User model
│   ├── Employee.js          # Employee model
│   ├── Department.js        # Department model
│   ├── Attendance.js        # Attendance model
│   ├── Payroll.js           # Payroll model
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── employees.js         # Employee routes
│   ├── departments.js       # Department routes
│   ├── attendance.js        # Attendance routes
│   ├── payroll.js           # Payroll routes
│   └── index.js             # Main router
├── utils/
│   └── seed.js              # Database seeding script
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
├── env.example              # Environment variables example
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

| Variable     | Description         | Default        |
| ------------ | ------------------- | -------------- |
| `DB_NAME`    | MySQL database name | `erp_database` |
| `DB_USER`    | MySQL username      | `root`         |
| `DB_PASS`    | MySQL password      | `password`     |
| `DB_HOST`    | MySQL host          | `localhost`    |
| `JWT_SECRET` | JWT signing secret  | Required       |
| `PORT`       | Server port         | `3000`         |
| `NODE_ENV`   | Environment         | `development`  |

### Database Models

#### User Model

- `id`, `name`, `email`, `password`, `role`, `isActive`
- Roles: `admin`, `hr`, `employee`

#### Employee Model

- `id`, `name`, `email`, `phone`, `address`, `designation`, `salary`, `joiningDate`, `departmentId`, `userId`, `isActive`

#### Department Model

- `id`, `name`, `description`, `isActive`

#### Attendance Model

- `id`, `employeeId`, `date`, `checkIn`, `checkOut`, `status`, `workingHours`, `notes`
- Status: `present`, `absent`, `late`, `half_day`

#### Payroll Model

- `id`, `employeeId`, `month`, `year`, `baseSalary`, `bonus`, `overtime`, `allowances`, `deductions`, `totalPay`, `paymentDate`, `status`, `notes`
- Status: `pending`, `paid`, `cancelled`

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production` in your environment
2. Use a strong JWT secret
3. Configure proper database credentials
4. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name "erp-backend"
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing

Use tools like Postman or curl to test the API endpoints:

1. Register a new user
2. Login to get JWT token
3. Use the token to access protected endpoints
4. Test CRUD operations for each module

### Example Test Script

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test API documentation
curl http://localhost:3000/api/docs
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- SQL injection protection via Sequelize ORM
- CORS configuration
- Error handling without sensitive data exposure

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the API documentation at `/api/docs`
- Review the health endpoint at `/api/health`
- Check server logs for detailed error information

---
