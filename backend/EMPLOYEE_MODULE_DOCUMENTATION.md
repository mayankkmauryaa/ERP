# Employee Module Documentation

## Overview

The Employee module provides comprehensive CRUD operations for managing employees in the ERP system. It includes proper authentication, role-based access control, and data validation.

## Features

### ✅ Core CRUD Operations

- **Create**: Add new employees with department and user associations
- **Read**: Retrieve employees with pagination, filtering, and search
- **Update**: Modify employee information with validation
- **Delete**: Soft delete employees (deactivation)

### ✅ Advanced Features

- **Department Association**: Employees are linked to departments via foreign key
- **User Association**: Each employee is linked to a user account
- **Role-based Access**: Admin, HR, and Employee roles with different permissions
- **Search & Filtering**: Search by name, email, designation; filter by department, status
- **Pagination**: Efficient data retrieval with pagination support
- **Statistics**: Comprehensive employee analytics and reporting
- **Soft Delete**: Deactivate/reactivate employees without data loss

## API Endpoints

### Authentication Required

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Get All Employees

```api
GET /api/employees
```

**Access**: Admin, HR  
**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name, email, or designation
- `departmentId` (optional): Filter by department
- `isActive` (optional): Filter by active status (true/false)

**Response**:

```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### 2. Get Employee by ID

```api
GET /api/employees/:id
```

**Access**: Admin, HR, Employee (own data only)  
**Parameters**: `id` - Employee ID

### 3. Create Employee

```api
POST /api/employees
```

**Access**: Admin, HR  
**Body**:

```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "designation": "Software Engineer",
  "salary": 75000.0,
  "joiningDate": "2024-01-15",
  "departmentId": 1,
  "userId": 1
}
```

### 4. Update Employee

```api
PUT /api/employees/:id
```

**Access**: Admin, HR, Employee (own data only)  
**Body**: Partial update with fields to modify

### 5. Delete Employee (Soft Delete)

```api
DELETE /api/employees/:id
```

**Access**: Admin, HR  
**Action**: Sets `isActive` to false

### 6. Get Employee Statistics

```api
GET /api/employees/stats
```

**Access**: Admin, HR  
**Response**:

```json
{
  "success": true,
  "data": {
    "totalEmployees": 100,
    "activeEmployees": 95,
    "inactiveEmployees": 5,
    "employeesByDepartment": [...],
    "employeesByDesignation": [...],
    "salaryStatistics": {
      "average": 65000,
      "minimum": 40000,
      "maximum": 120000
    }
  }
}
```

### 7. Get Employee Profile

```api
GET /api/employees/profile
```

**Access**: Employee (own profile only)

### 8. Get Employees by Department

```api
GET /api/employees/department/:departmentId
```

**Access**: Admin, HR  
**Parameters**: `departmentId` - Department ID

### 9. Reactivate Employee

```api
PUT /api/employees/:id/reactivate
```

**Access**: Admin, HR  
**Action**: Sets `isActive` to true

## Data Model

### Employee Schema

```javascript
{
  id: INTEGER (Primary Key, Auto Increment)
  name: STRING(100) (Required, 2-100 chars)
  email: STRING(100) (Required, Unique, Valid Email)
  phone: STRING(20) (Optional, 10-20 chars)
  address: TEXT (Optional)
  designation: STRING(100) (Required, 2-100 chars)
  salary: DECIMAL(10,2) (Required, >= 0)
  joiningDate: DATEONLY (Required, Valid Date)
  departmentId: INTEGER (Required, Foreign Key to Department)
  userId: INTEGER (Required, Unique, Foreign Key to User)
  isActive: BOOLEAN (Default: true)
  createdAt: DATETIME (Auto-generated)
  updatedAt: DATETIME (Auto-generated)
}
```

### Associations

- **Employee belongsTo Department**: `departmentId` → `departments.id`
- **Employee belongsTo User**: `userId` → `users.id`
- **Employee hasMany Attendance**: `employees.id` → `attendances.employeeId`
- **Employee hasMany Payroll**: `employees.id` → `payrolls.employeeId`

## Validation Rules

### Employee Creation/Update

- `name`: Required, 2-100 characters
- `email`: Required, valid email format, unique
- `phone`: Optional, 10-20 characters
- `designation`: Required, 2-100 characters
- `salary`: Required, positive decimal number
- `joiningDate`: Required, valid ISO date
- `departmentId`: Required, must exist in departments table
- `userId`: Required, must exist in users table, unique

### Business Rules

- Each user can only have one employee record
- Email must be unique across all employees
- Department must exist and be active
- User must exist and be active
- Salary must be a positive number

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (Validation errors)
- `401`: Unauthorized (Missing/invalid token)
- `403`: Forbidden (Insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

### Authentication

- JWT token required for all endpoints
- Token validation with user existence check
- Account deactivation handling

### Authorization

- **Admin**: Full access to all employee operations
- **HR**: Full access to all employee operations
- **Employee**: Access to own profile only

### Data Protection

- Input validation and sanitization
- SQL injection prevention via Sequelize ORM
- XSS protection through proper data handling

## Usage Examples

### Creating an Employee

```javascript
// 1. Create User first
const user = await User.create({
  name: "John Doe",
  email: "john.doe@company.com",
  password: "hashedPassword",
  role: "employee",
});

// 2. Create Employee
const employee = await Employee.create({
  name: "John Doe",
  email: "john.doe@company.com",
  designation: "Software Engineer",
  salary: 75000.0,
  joiningDate: "2024-01-15",
  departmentId: 1,
  userId: user.id,
});
```

### Getting Employees with Associations

```javascript
const employees = await Employee.findAll({
  include: [
    {
      model: Department,
      as: "department",
      attributes: ["id", "name"],
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "email", "role"],
    },
  ],
  where: { isActive: true },
});
```

## Testing

Run the test script to verify functionality:

```bash
node test_employee_module.js
```

## Dependencies

- **Sequelize**: ORM for database operations
- **Express**: Web framework
- **JWT**: Authentication tokens
- **Express-validator**: Input validation
- **bcrypt**: Password hashing (for User model)

## Performance Considerations

- Pagination implemented for large datasets
- Indexed foreign keys for efficient joins
- Soft delete to maintain data integrity
- Optimized queries with selective field inclusion

## Future Enhancements

- Employee photo upload
- Advanced search with multiple criteria
- Bulk operations (import/export)
- Employee hierarchy management
- Performance metrics and reporting
- Integration with external HR systems
