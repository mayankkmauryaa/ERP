# Payroll Module Documentation

## Overview

The Payroll module provides comprehensive payroll management for employees in the ERP system. It integrates with Employee, Leave, and Attendance models to calculate accurate salaries with automatic deductions and bonuses.

## Features

### ✅ Core Payroll Operations

- **Payroll Generation**: Generate individual or bulk payroll records
- **Automatic Calculations**: Integration with Leave and Attendance for deductions and bonuses
- **Payment Management**: Track payment status and dates
- **Employee Self-Service**: Employees can view their own payroll records
- **Comprehensive Reporting**: Detailed payroll analytics and summaries

### ✅ Advanced Features

- **Leave Integration**: Automatic deductions for unpaid leave
- **Attendance Integration**: Automatic bonuses for good attendance
- **Bulk Operations**: Generate payroll for all employees at once
- **Payment Tracking**: Track who generated and paid each payroll
- **Role-based Access**: Different permissions for Admin, HR, and Employees
- **Statistics & Analytics**: Comprehensive payroll analytics

## API Endpoints

### Authentication Required

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Get All Payroll Records

```api
GET /api/payroll
```

**Access**: Admin, HR  
**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `employeeId` (optional): Filter by employee ID
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year
- `status` (optional): Filter by status (pending/paid/cancelled)

**Response**:

```json
{
  "success": true,
  "message": "Payroll records retrieved successfully",
  "data": {
    "payrolls": [
      {
        "id": 1,
        "employeeId": 1,
        "month": 1,
        "year": 2024,
        "baseSalary": 5000.00,
        "bonus": 500.00,
        "overtime": 200.00,
        "allowances": 300.00,
        "deductions": 100.00,
        "leaveDeductions": 150.00,
        "attendanceBonus": 200.00,
        "totalPay": 5950.00,
        "status": "paid",
        "paymentDate": "2024-01-31",
        "generatedBy": 2,
        "generatedAt": "2024-01-30T10:00:00.000Z",
        "paidBy": 2,
        "paidAt": "2024-01-31T14:30:00.000Z",
        "notes": "Monthly payroll",
        "employee": {
          "id": 1,
          "name": "John Doe",
          "designation": "Software Engineer",
          "salary": 5000.00,
          "department": {
            "id": 1,
            "name": "Engineering"
          }
        },
        "generatedByUser": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane.smith@company.com"
        },
        "paidByUser": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane.smith@company.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### 2. Get Payroll by ID

```api
GET /api/payroll/:id
```

**Access**: Admin, HR, Employee (own data only)  
**Parameters**: `id` - Payroll record ID

### 3. Generate Payroll

```api
POST /api/payroll
```

**Access**: Admin, HR  
**Body**:

```json
{
  "employeeId": 1,
  "month": 1,
  "year": 2024,
  "baseSalary": 5000.00,
  "bonus": 500.00,
  "overtime": 200.00,
  "allowances": 300.00,
  "deductions": 100.00,
  "notes": "Monthly payroll with performance bonus"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Payroll generated successfully",
  "data": {
    "payroll": {
      "id": 1,
      "employeeId": 1,
      "month": 1,
      "year": 2024,
      "baseSalary": 5000.00,
      "bonus": 500.00,
      "overtime": 200.00,
      "allowances": 300.00,
      "deductions": 100.00,
      "leaveDeductions": 150.00,
      "attendanceBonus": 200.00,
      "totalPay": 5950.00,
      "status": "pending",
      "generatedBy": 2,
      "generatedAt": "2024-01-30T10:00:00.000Z",
      "notes": "Monthly payroll with performance bonus",
      "employee": {
        "id": 1,
        "name": "John Doe",
        "designation": "Software Engineer",
        "salary": 5000.00,
        "department": {
          "id": 1,
          "name": "Engineering"
        }
      },
      "generatedByUser": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@company.com"
      }
    }
  }
}
```

### 4. Generate Bulk Payroll

```api
POST /api/payroll/bulk
```

**Access**: Admin, HR  
**Body**:

```json
{
  "month": 1,
  "year": 2024,
  "bonus": 500.00,
  "overtime": 0.00,
  "allowances": 200.00,
  "deductions": 0.00
}
```

**Response**:

```json
{
  "success": true,
  "message": "Bulk payroll generation completed",
  "data": {
    "generatedCount": 25,
    "totalEmployees": 25,
    "generatedPayrolls": [...],
    "errors": []
  }
}
```

### 5. Update Payroll

```api
PUT /api/payroll/:id
```

**Access**: Admin, HR  
**Body**: Partial update with fields to modify

### 6. Mark Payroll as Paid

```api
PUT /api/payroll/:id/mark-paid
```

**Access**: Admin, HR  
**Body**:

```json
{
  "paymentDate": "2024-01-31"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Payroll marked as paid successfully",
  "data": {
    "payroll": {
      "id": 1,
      "employeeId": 1,
      "month": 1,
      "year": 2024,
      "baseSalary": 5000.00,
      "bonus": 500.00,
      "overtime": 200.00,
      "allowances": 300.00,
      "deductions": 100.00,
      "leaveDeductions": 150.00,
      "attendanceBonus": 200.00,
      "totalPay": 5950.00,
      "status": "paid",
      "paymentDate": "2024-01-31",
      "paidBy": 2,
      "paidAt": "2024-01-31T14:30:00.000Z",
      "employee": {
        "id": 1,
        "name": "John Doe",
        "designation": "Software Engineer",
        "department": {
          "id": 1,
          "name": "Engineering"
        }
      },
      "paidByUser": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@company.com"
      }
    }
  }
}
```

### 7. Get My Payroll Records

```api
GET /api/payroll/my
```

**Access**: Employee (own records only)  
**Query Parameters**: Same as GET /api/payroll

### 8. Get Payroll Summary

```api
GET /api/payroll/summary/:employeeId
```

**Access**: Admin, HR, Employee (own data only)  
**Query Parameters**:

- `year` (optional): Year (default: current year)

**Response**:

```json
{
  "success": true,
  "message": "Payroll summary retrieved successfully",
  "data": {
    "employee": {
      "id": 1,
      "name": "John Doe",
      "designation": "Software Engineer"
    },
    "year": 2024,
    "summary": {
      "totalPayrolls": 12,
      "paidPayrolls": 11,
      "pendingPayrolls": 1,
      "totalPay": 71400.00,
      "totalPaid": 65450.00,
      "averageMonthlyPay": 5950.00
    },
    "monthlyBreakdown": [
      {
        "month": 1,
        "year": 2024,
        "baseSalary": 5000.00,
        "bonus": 500.00,
        "overtime": 200.00,
        "allowances": 300.00,
        "deductions": 100.00,
        "leaveDeductions": 150.00,
        "attendanceBonus": 200.00,
        "totalPay": 5950.00,
        "status": "paid",
        "paymentDate": "2024-01-31"
      }
    ]
  }
}
```

### 9. Get Payroll Statistics

```api
GET /api/payroll/stats
```

**Access**: Admin, HR  
**Query Parameters**:

- `month` (optional): Month (default: current month)
- `year` (optional): Year (default: current year)

**Response**:

```json
{
  "success": true,
  "message": "Payroll statistics retrieved successfully",
  "data": {
    "month": 1,
    "year": 2024,
    "totalPayrolls": 25,
    "payrollByStatus": [
      {
        "status": "pending",
        "count": "5"
      },
      {
        "status": "paid",
        "count": "18"
      },
      {
        "status": "cancelled",
        "count": "2"
      }
    ],
    "totalAmountPaid": 125000.00,
    "averageSalary": 5000.00
  }
}
```

### 10. Cancel Payroll

```api
PUT /api/payroll/:id/cancel
```

**Access**: Admin, HR  
**Body**:

```json
{
  "reason": "Employee terminated"
}
```

## Data Model

### Payroll Schema

```javascript
{
  id: INTEGER (Primary Key, Auto Increment)
  employeeId: INTEGER (Required, Foreign Key to Employee)
  month: INTEGER (Required, 1-12)
  year: INTEGER (Required, 2020-2030)
  baseSalary: DECIMAL(10,2) (Required, >= 0)
  bonus: DECIMAL(10,2) (Default: 0, >= 0)
  overtime: DECIMAL(10,2) (Default: 0, >= 0)
  allowances: DECIMAL(10,2) (Default: 0, >= 0)
  deductions: DECIMAL(10,2) (Default: 0, >= 0)
  leaveDeductions: DECIMAL(10,2) (Default: 0, >= 0)
  attendanceBonus: DECIMAL(10,2) (Default: 0, >= 0)
  totalPay: DECIMAL(10,2) (Required, >= 0)
  status: ENUM (Required, 'pending', 'paid', 'cancelled')
  paymentDate: DATEONLY (Optional, When paid)
  generatedBy: INTEGER (Optional, Foreign Key to User)
  generatedAt: DATETIME (Optional, When generated)
  paidBy: INTEGER (Optional, Foreign Key to User)
  paidAt: DATETIME (Optional, When paid)
  notes: TEXT (Optional)
  createdAt: DATETIME (Auto-generated)
  updatedAt: DATETIME (Auto-generated)
}
```

### Associations

- **Payroll belongsTo Employee**: `employeeId` → `employees.id`
- **Payroll belongsTo User (Generator)**: `generatedBy` → `users.id`
- **Payroll belongsTo User (Payer)**: `paidBy` → `users.id`
- **Employee hasMany Payroll**: `employees.id` → `payrolls.employeeId`
- **User hasMany Generated Payrolls**: `users.id` → `payrolls.generatedBy`
- **User hasMany Paid Payrolls**: `users.id` → `payrolls.paidBy`

## Business Rules

### Automatic Calculations

1. **Leave Deductions**: Calculated based on unpaid leave (sick, emergency)
2. **Attendance Bonus**: Calculated based on attendance percentage
   - 100% attendance: $500 bonus
   - 90%+ attendance: $200 bonus
3. **Total Pay**: `baseSalary + bonus + overtime + allowances + attendanceBonus - deductions - leaveDeductions`

### Validation Rules

- Only one payroll record per employee per month/year
- Base salary must be positive
- All financial fields must be non-negative
- Cannot cancel paid payroll records
- Payment date must be valid

### Access Control

- **Admin/HR**: Full access to all payroll operations
- **Employee**: Can only access their own payroll records
- **Self-service**: Employees can view their payroll history and summaries

## Usage Examples

### Admin/HR Payroll Management

```javascript
// 1. Generate payroll for an employee
POST /api/payroll
{
  "employeeId": 1,
  "month": 1,
  "year": 2024,
  "baseSalary": 5000.00,
  "bonus": 500.00,
  "overtime": 200.00,
  "allowances": 300.00,
  "deductions": 100.00,
  "notes": "Monthly payroll with performance bonus"
}

// 2. Generate bulk payroll for all employees
POST /api/payroll/bulk
{
  "month": 1,
  "year": 2024,
  "bonus": 500.00,
  "allowances": 200.00
}

// 3. Mark payroll as paid
PUT /api/payroll/1/mark-paid
{
  "paymentDate": "2024-01-31"
}

// 4. Get payroll statistics
GET /api/payroll/stats?month=1&year=2024
```

### Employee Self-Service

```javascript
// 1. Get my payroll records
GET /api/payroll/my?year=2024

// 2. Get my payroll summary
GET /api/payroll/summary/1?year=2024

// 3. Get specific payroll record
GET /api/payroll/1
```

### HR Analytics

```javascript
// 1. Get all pending payrolls
GET /api/payroll?status=pending

// 2. Get payrolls for specific month
GET /api/payroll?month=1&year=2024

// 3. Get payrolls for specific employee
GET /api/payroll?employeeId=1&year=2024

// 4. Get paid payrolls
GET /api/payroll?status=paid&month=1&year=2024
```

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
- `400`: Bad Request (Validation errors, business rule violations)
- `401`: Unauthorized (Missing/invalid token)
- `403`: Forbidden (Insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Scenarios

- **Duplicate Payroll**: "Payroll already exists for this employee and month/year"
- **Invalid Amount**: "Base salary must be a positive number"
- **Cannot Cancel Paid**: "Cannot cancel a paid payroll record"
- **Employee Not Found**: "Employee not found"
- **Payroll Not Found**: "Payroll record not found"

## Security Features

### Authentication

- JWT token required for all endpoints
- Token validation with user existence check
- Account deactivation handling

### Authorization

- **Admin**: Full access to all payroll operations
- **HR**: Full access to all payroll operations
- **Employee**: Access to own payroll records only

### Data Protection

- Input validation and sanitization
- SQL injection prevention via Sequelize ORM
- XSS protection through proper data handling
- Business rule enforcement

## Performance Considerations

- Pagination implemented for large datasets
- Indexed foreign keys for efficient joins
- Optimized queries with selective field inclusion
- Efficient date filtering with database functions

## Future Enhancements

- Tax calculations and deductions
- Payroll templates and presets
- Direct deposit integration
- Payroll reports and PDF generation
- Integration with accounting systems
- Payroll approval workflow
- Employee self-service portal
- Mobile app support
- Real-time notifications
- Advanced analytics and dashboards
