# Attendance Module Documentation

## Overview

The Attendance module provides comprehensive attendance management for employees in the ERP system. It includes daily check-in/check-out functionality, attendance tracking, monthly summaries, and role-based access control.

## Features

### ✅ Core Attendance Operations

- **Daily Check-in/Check-out**: Employees can mark their daily attendance
- **Attendance Management**: Admin/HR can manage attendance records
- **Monthly Summaries**: Comprehensive attendance reports and analytics
- **Status Tracking**: Present, Absent, Late, Half-day status tracking
- **Working Hours Calculation**: Automatic calculation of working hours, overtime, and late minutes

### ✅ Advanced Features

- **Automatic Calculations**: Working hours, overtime, and late minutes
- **Role-based Access**: Different permissions for Admin, HR, and Employees
- **Pagination & Filtering**: Efficient data retrieval with search and filters
- **Statistics & Analytics**: Comprehensive attendance analytics
- **Self-service**: Employees can view their own attendance records

## API Endpoints

### Authentication Required

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Get All Attendance Records

```api
GET /api/attendance
```

**Access**: Admin, HR  
**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `employeeId` (optional): Filter by employee ID
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `status` (optional): Filter by status (present/absent/late/half_day)
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year

**Response**:

```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "attendance": [
      {
        "id": 1,
        "employeeId": 1,
        "date": "2024-01-15",
        "checkIn": "09:00:00",
        "checkOut": "17:30:00",
        "status": "present",
        "workingHours": 8.5,
        "isLate": false,
        "lateMinutes": null,
        "overtimeHours": 0.5,
        "notes": "Regular day",
        "employee": {
          "id": 1,
          "name": "John Doe",
          "designation": "Software Engineer",
          "department": {
            "id": 1,
            "name": "Engineering"
          }
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

### 2. Get Attendance by ID

```api
GET /api/attendance/:id
```

**Access**: Admin, HR  
**Parameters**: `id` - Attendance record ID

### 3. Mark Attendance (Admin/HR)

```api
POST /api/attendance
```

**Access**: Admin, HR  
**Body**:

```json
{
  "employeeId": 1,
  "date": "2024-01-15",
  "checkIn": "09:00:00",
  "checkOut": "17:30:00",
  "status": "present",
  "notes": "Regular working day"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
      "id": 1,
      "employeeId": 1,
      "date": "2024-01-15",
      "checkIn": "09:00:00",
      "checkOut": "17:30:00",
      "status": "present",
      "workingHours": 8.5,
      "isLate": false,
      "lateMinutes": null,
      "overtimeHours": 0.5,
      "notes": "Regular working day",
      "employee": {
        "id": 1,
        "name": "John Doe",
        "designation": "Software Engineer",
        "department": {
          "id": 1,
          "name": "Engineering"
        }
      }
    }
  }
}
```

### 4. Update Attendance

```api
PUT /api/attendance/:id
```

**Access**: Admin, HR  
**Body**: Partial update with fields to modify

### 5. Get Monthly Summary

```api
GET /api/attendance/monthly/:employeeId/:month/:year
```

**Access**: Admin, HR, Employee (own data only)  
**Parameters**:

- `employeeId` - Employee ID
- `month` - Month (1-12)
- `year` - Year (2020-2030)

**Response**:

```json
{
  "success": true,
  "message": "Monthly attendance summary retrieved successfully",
  "data": {
    "employee": {
      "id": 1,
      "name": "John Doe",
      "designation": "Software Engineer"
    },
    "month": 1,
    "year": 2024,
    "summary": {
      "totalDays": 22,
      "presentDays": 20,
      "absentDays": 1,
      "lateDays": 2,
      "halfDays": 0,
      "totalWorkingHours": 160.5,
      "averageWorkingHours": 8.25
    },
    "attendanceRecords": [...]
  }
}
```

### 6. Get Attendance Statistics

```api
GET /api/attendance/stats
```

**Access**: Admin, HR  
**Query Parameters**:

- `month` (optional): Month (default: current month)
- `year` (optional): Year (default: current year)

### 7. Employee Self-Service Endpoints

#### Get My Attendance Records

```api
GET /api/attendance/my/records
```

**Access**: Employee (own records only)  
**Query Parameters**: Same as GET /api/attendance

#### Get Today's Status

```api
GET /api/attendance/my/today
```

**Access**: Employee  
**Response**:

```json
{
  "success": true,
  "message": "Today's attendance status retrieved successfully",
  "data": {
    "date": "2024-01-15",
    "status": "present",
    "checkIn": "09:00:00",
    "checkOut": "17:30:00",
    "workingHours": 8.5,
    "isLate": false,
    "lateMinutes": null,
    "overtimeHours": 0.5,
    "notes": "Regular day"
  }
}
```

#### Check In

```api
POST /api/attendance/checkin
```

**Access**: Employee  
**Body**:

```json
{
  "notes": "Starting work for the day"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "date": "2024-01-15",
    "checkIn": "09:00:00"
  }
}
```

#### Check Out

```api
POST /api/attendance/checkout
```

**Access**: Employee  
**Body**:

```json
{
  "notes": "End of work day"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "date": "2024-01-15",
    "checkIn": "09:00:00",
    "checkOut": "17:30:00",
    "workingHours": 8.5,
    "isLate": false,
    "lateMinutes": null,
    "overtimeHours": 0.5
  }
}
```

## Data Model

### Attendance Schema

```javascript
{
  id: INTEGER (Primary Key, Auto Increment)
  employeeId: INTEGER (Required, Foreign Key to Employee)
  date: DATEONLY (Required, Unique per employee)
  checkIn: TIME (Optional, HH:MM format)
  checkOut: TIME (Optional, HH:MM format)
  status: ENUM (Required, 'present', 'absent', 'late', 'half_day')
  workingHours: DECIMAL(4,2) (Optional, 0-24 hours)
  notes: TEXT (Optional, Max 500 characters)
  isLate: BOOLEAN (Default: false)
  lateMinutes: INTEGER (Optional, Minutes late)
  overtimeHours: DECIMAL(4,2) (Optional, 0-12 hours)
  createdAt: DATETIME (Auto-generated)
  updatedAt: DATETIME (Auto-generated)
}
```

### Associations

- **Attendance belongsTo Employee**: `employeeId` → `employees.id`
- **Employee hasMany Attendance**: `employees.id` → `attendances.employeeId`

## Business Rules

### Automatic Calculations

1. **Working Hours**: Calculated as `checkOut - checkIn`
2. **Late Status**: Employee is late if check-in is after 9:00 AM
3. **Late Minutes**: Minutes late from 9:00 AM standard start time
4. **Overtime**: Hours worked beyond 8 hours standard working time

### Validation Rules

- Only one attendance record per employee per date
- Check-out time must be after check-in time
- Working hours cannot be negative
- Status must be one of: present, absent, late, half_day
- Time format must be HH:MM (24-hour format)

### Access Control

- **Admin/HR**: Full access to all attendance operations
- **Employee**: Can only access their own attendance records
- **Self-service**: Employees can check-in/check-out and view their records

## Usage Examples

### Employee Daily Workflow

```javascript
// 1. Check in for the day
POST /api/attendance/checkin
{
  "notes": "Starting work"
}

// 2. Check today's status
GET /api/attendance/my/today

// 3. Check out at end of day
POST /api/attendance/checkout
{
  "notes": "End of work day"
}
```

### Admin Managing Attendance

```javascript
// 1. Mark attendance for an employee
POST /api/attendance
{
  "employeeId": 1,
  "date": "2024-01-15",
  "checkIn": "09:00:00",
  "checkOut": "17:30:00",
  "status": "present",
  "notes": "Regular working day"
}

// 2. Get monthly summary for employee
GET /api/attendance/monthly/1/1/2024

// 3. Get all attendance records with filters
GET /api/attendance?employeeId=1&month=1&year=2024&status=present
```

### HR Analytics

```javascript
// 1. Get attendance statistics
GET /api/attendance/stats?month=1&year=2024

// 2. Get attendance records for specific date range
GET /api/attendance?startDate=2024-01-01&endDate=2024-01-31

// 3. Get late employees for the month
GET /api/attendance?month=1&year=2024&status=late
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

- **Duplicate Attendance**: "Attendance already marked for this date"
- **Invalid Time**: "Check-out time must be after check-in time"
- **Missing Check-in**: "You must check in first before checking out"
- **Already Checked In**: "You have already checked in today"
- **Employee Not Found**: "Employee profile not found"

## Security Features

### Authentication

- JWT token required for all endpoints
- Token validation with user existence check
- Account deactivation handling

### Authorization

- **Admin**: Full access to all attendance operations
- **HR**: Full access to all attendance operations
- **Employee**: Access to own attendance records only

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

- Attendance approval workflow
- Leave integration
- Biometric integration
- Mobile app support
- Real-time notifications
- Advanced reporting and dashboards
- Integration with payroll system
- Attendance policies and rules engine
