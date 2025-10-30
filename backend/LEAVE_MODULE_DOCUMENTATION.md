# Leave Module Documentation

## Overview

The Leave module provides comprehensive leave management for employees in the ERP system. It includes leave request creation, approval/rejection workflow, and role-based access control.

## Features

### ✅ Core Leave Operations

- **Leave Request Creation**: Employees can apply for leave with detailed information
- **Approval Workflow**: Admin/HR can approve or reject leave requests
- **Leave Management**: Full CRUD operations for leave requests
- **Status Tracking**: Pending, Approved, Rejected status tracking
- **Leave Types**: Support for various leave types (sick, vacation, personal, etc.)

### ✅ Advanced Features

- **Automatic Calculations**: Total days calculation
- **Overlap Prevention**: Prevents overlapping leave requests
- **Role-based Access**: Different permissions for Admin, HR, and Employees
- **Pagination & Filtering**: Efficient data retrieval with search and filters
- **Statistics & Analytics**: Comprehensive leave analytics
- **Self-service**: Employees can manage their own leave requests

## API Endpoints

### Authentication Required

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Get All Leave Requests

```api
GET /api/leaves
```

**Access**: Admin, HR  
**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `employeeId` (optional): Filter by employee ID
- `status` (optional): Filter by status (pending/approved/rejected)
- `leaveType` (optional): Filter by leave type
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year

**Response**:

```json
{
  "success": true,
  "message": "Leave requests retrieved successfully",
  "data": {
    "leaves": [
      {
        "id": 1,
        "employeeId": 1,
        "startDate": "2024-01-15",
        "endDate": "2024-01-17",
        "reason": "Family vacation",
        "status": "pending",
        "leaveType": "vacation",
        "totalDays": 3,
        "approvedBy": null,
        "approvedAt": null,
        "rejectionReason": null,
        "notes": "Annual family trip",
        "createdAt": "2024-01-10T10:00:00.000Z",
        "employee": {
          "id": 1,
          "name": "John Doe",
          "designation": "Software Engineer",
          "email": "john.doe@company.com",
          "department": {
            "id": 1,
            "name": "Engineering"
          }
        },
        "approvedByUser": null
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

### 2. Get Leave Request by ID

```api
GET /api/leaves/:id
```

**Access**: Admin, HR, Employee (own data only)  
**Parameters**: `id` - Leave request ID

### 3. Create Leave Request

```api
POST /api/leaves
```

**Access**: Employee  
**Body**:

```json
{
  "employeeId": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "reason": "Family vacation to visit relatives",
  "leaveType": "vacation",
  "notes": "Annual family trip to visit grandparents"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Leave request created successfully",
  "data": {
    "leave": {
      "id": 1,
      "employeeId": 1,
      "startDate": "2024-01-15",
      "endDate": "2024-01-17",
      "reason": "Family vacation to visit relatives",
      "status": "pending",
      "leaveType": "vacation",
      "totalDays": 3,
      "notes": "Annual family trip to visit grandparents",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "employee": {
        "id": 1,
        "name": "John Doe",
        "designation": "Software Engineer",
        "email": "john.doe@company.com",
        "department": {
          "id": 1,
          "name": "Engineering"
        }
      }
    }
  }
}
```

### 4. Update Leave Request

```api
PUT /api/leaves/:id
```

**Access**: Employee (own data only)  
**Body**: Partial update with fields to modify

### 5. Approve Leave Request

```api
PUT /api/leaves/:id/approve
```

**Access**: Admin, HR  
**Body**:

```json
{
  "notes": "Approved for family vacation"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "leave": {
      "id": 1,
      "employeeId": 1,
      "startDate": "2024-01-15",
      "endDate": "2024-01-17",
      "reason": "Family vacation to visit relatives",
      "status": "approved",
      "leaveType": "vacation",
      "totalDays": 3,
      "approvedBy": 2,
      "approvedAt": "2024-01-11T14:30:00.000Z",
      "notes": "Approved for family vacation",
      "employee": {
        "id": 1,
        "name": "John Doe",
        "designation": "Software Engineer",
        "email": "john.doe@company.com",
        "department": {
          "id": 1,
          "name": "Engineering"
        }
      },
      "approvedByUser": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@company.com"
      }
    }
  }
}
```

### 6. Reject Leave Request

```api
PUT /api/leaves/:id/reject
```

**Access**: Admin, HR  
**Body**:

```json
{
  "rejectionReason": "Insufficient notice period. Please apply at least 2 weeks in advance."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Leave request rejected successfully",
  "data": {
    "leave": {
      "id": 1,
      "employeeId": 1,
      "startDate": "2024-01-15",
      "endDate": "2024-01-17",
      "reason": "Family vacation to visit relatives",
      "status": "rejected",
      "leaveType": "vacation",
      "totalDays": 3,
      "approvedBy": 2,
      "approvedAt": "2024-01-11T14:30:00.000Z",
      "rejectionReason": "Insufficient notice period. Please apply at least 2 weeks in advance.",
      "employee": {
        "id": 1,
        "name": "John Doe",
        "designation": "Software Engineer",
        "email": "john.doe@company.com",
        "department": {
          "id": 1,
          "name": "Engineering"
        }
      },
      "approvedByUser": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@company.com"
      }
    }
  }
}
```

### 7. Get My Leave Requests

```api
GET /api/leaves/my
```

**Access**: Employee (own records only)  
**Query Parameters**: Same as GET /api/leaves

### 8. Get Leave Statistics

```api
GET /api/leaves/stats
```

**Access**: Admin, HR  
**Query Parameters**:

- `month` (optional): Month (default: current month)
- `year` (optional): Year (default: current year)

**Response**:

```json
{
  "success": true,
  "message": "Leave statistics retrieved successfully",
  "data": {
    "month": 1,
    "year": 2024,
    "totalLeaves": 25,
    "leavesByStatus": [
      {
        "status": "pending",
        "count": "5"
      },
      {
        "status": "approved",
        "count": "18"
      },
      {
        "status": "rejected",
        "count": "2"
      }
    ],
    "leavesByType": [
      {
        "leaveType": "vacation",
        "count": "12"
      },
      {
        "leaveType": "sick",
        "count": "8"
      },
      {
        "leaveType": "personal",
        "count": "5"
      }
    ],
    "averageDuration": 2.5
  }
}
```

### 9. Delete Leave Request

```api
DELETE /api/leaves/:id
```

**Access**: Employee (own data only)  
**Note**: Can only delete pending leave requests

## Data Model

### Leave Schema

```javascript
{
  id: INTEGER (Primary Key, Auto Increment)
  employeeId: INTEGER (Required, Foreign Key to Employee)
  startDate: DATEONLY (Required, Must be today or later)
  endDate: DATEONLY (Required, Must be today or later)
  reason: TEXT (Required, 10-1000 characters)
  status: ENUM (Required, 'pending', 'approved', 'rejected')
  leaveType: ENUM (Required, 'sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'other')
  totalDays: INTEGER (Required, 1-365 days)
  approvedBy: INTEGER (Optional, Foreign Key to User)
  approvedAt: DATETIME (Optional, When approved/rejected)
  rejectionReason: TEXT (Optional, 10-500 characters)
  notes: TEXT (Optional, Max 500 characters)
  createdAt: DATETIME (Auto-generated)
  updatedAt: DATETIME (Auto-generated)
}
```

### Associations

- **Leave belongsTo Employee**: `employeeId` → `employees.id`
- **Leave belongsTo User (Approver)**: `approvedBy` → `users.id`
- **Employee hasMany Leaves**: `employees.id` → `leaves.employeeId`
- **User hasMany Approved Leaves**: `users.id` → `leaves.approvedBy`

## Business Rules

### Automatic Calculations

1. **Total Days**: Calculated as `(endDate - startDate) + 1`
2. **Date Validation**: Start and end dates must be today or later
3. **Overlap Prevention**: Cannot have overlapping approved or pending leaves
4. **Status Transitions**: Only pending leaves can be updated or deleted

### Validation Rules

- Start date must be before or equal to end date
- Reason must be between 10 and 1000 characters
- Leave type must be one of the predefined types
- Only pending leaves can be updated or deleted
- Rejection reason is required when rejecting leave

### Access Control

- **Admin/HR**: Full access to all leave operations
- **Employee**: Can only access their own leave requests
- **Self-service**: Employees can create, update, and delete their own pending leaves

## Usage Examples

### Employee Leave Workflow

```javascript
// 1. Create leave request
POST /api/leaves
{
  "employeeId": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "reason": "Family vacation to visit relatives",
  "leaveType": "vacation",
  "notes": "Annual family trip"
}

// 2. Check my leave requests
GET /api/leaves/my

// 3. Update leave request (if pending)
PUT /api/leaves/1
{
  "endDate": "2024-01-18",
  "notes": "Extended trip by one day"
}

// 4. Delete leave request (if pending)
DELETE /api/leaves/1
```

### Admin/HR Leave Management

```javascript
// 1. Get all pending leave requests
GET /api/leaves?status=pending

// 2. Approve leave request
PUT /api/leaves/1/approve
{
  "notes": "Approved for family vacation"
}

// 3. Reject leave request
PUT /api/leaves/2/reject
{
  "rejectionReason": "Insufficient notice period. Please apply at least 2 weeks in advance."
}

// 4. Get leave statistics
GET /api/leaves/stats?month=1&year=2024

// 5. Get leaves by type
GET /api/leaves?leaveType=vacation&status=approved
```

### HR Analytics

```javascript
// 1. Get leave statistics for the month
GET /api/leaves/stats?month=1&year=2024

// 2. Get all approved leaves for date range
GET /api/leaves?startDate=2024-01-01&endDate=2024-01-31&status=approved

// 3. Get sick leaves for the month
GET /api/leaves?leaveType=sick&month=1&year=2024

// 4. Get employee's leave history
GET /api/leaves?employeeId=1&startDate=2024-01-01&endDate=2024-12-31
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

- **Overlapping Leave**: "You already have a leave request for this period"
- **Invalid Date Range**: "Start date must be before or equal to end date"
- **Past Dates**: "Start date must be today or later"
- **Already Processed**: "Leave request is already approved/rejected"
- **Insufficient Reason**: "Rejection reason is required and must be at least 10 characters"
- **Employee Not Found**: "Employee not found"

## Security Features

### Authentication

- JWT token required for all endpoints
- Token validation with user existence check
- Account deactivation handling

### Authorization

- **Admin**: Full access to all leave operations
- **HR**: Full access to all leave operations
- **Employee**: Access to own leave requests only

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

- Leave balance tracking
- Leave policy integration
- Email notifications for leave status changes
- Leave calendar integration
- Bulk leave operations
- Leave approval workflow with multiple approvers
- Integration with attendance system
- Leave reports and analytics dashboard
