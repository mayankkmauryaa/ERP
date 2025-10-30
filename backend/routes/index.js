const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const employeeRoutes = require('./employees');
const departmentRoutes = require('./departments');
const attendanceRoutes = require('./attendance');
const payrollRoutes = require('./payroll');
const leaveRoutes = require('./leaves');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ERP Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'ERP Backend API Documentation',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change user password'
      },
      employees: {
        'GET /api/employees': 'Get all employees (Admin, HR)',
        'GET /api/employees/stats': 'Get employee statistics (Admin, HR)',
        'GET /api/employees/profile': 'Get current employee profile (Employee)',
        'GET /api/employees/department/:departmentId': 'Get employees by department (Admin, HR)',
        'GET /api/employees/:id': 'Get employee by ID',
        'POST /api/employees': 'Create new employee (Admin, HR)',
        'PUT /api/employees/:id': 'Update employee',
        'PUT /api/employees/:id/reactivate': 'Reactivate employee (Admin, HR)',
        'DELETE /api/employees/:id': 'Delete employee (Admin, HR)'
      },
      departments: {
        'GET /api/departments': 'Get all departments (Admin, HR)',
        'GET /api/departments/stats': 'Get department statistics (Admin, HR)',
        'GET /api/departments/:id': 'Get department by ID (Admin, HR)',
        'POST /api/departments': 'Create new department (Admin, HR)',
        'PUT /api/departments/:id': 'Update department (Admin, HR)',
        'DELETE /api/departments/:id': 'Delete department (Admin, HR)'
      },
      attendance: {
        'GET /api/attendance': 'Get all attendance records (Admin, HR)',
        'GET /api/attendance/stats': 'Get attendance statistics (Admin, HR)',
        'GET /api/attendance/monthly/:employeeId/:month/:year': 'Get monthly summary',
        'GET /api/attendance/:id': 'Get attendance by ID (Admin, HR)',
        'GET /api/attendance/my/records': 'Get my attendance records (Employee)',
        'GET /api/attendance/my/today': 'Get today\'s status (Employee)',
        'POST /api/attendance': 'Mark attendance (Admin, HR)',
        'POST /api/attendance/checkin': 'Check in for the day (Employee)',
        'POST /api/attendance/checkout': 'Check out for the day (Employee)',
        'PUT /api/attendance/:id': 'Update attendance (Admin, HR)'
      },
      payroll: {
        'GET /api/payroll': 'Get all payroll records (Admin, HR)',
        'GET /api/payroll/stats': 'Get payroll statistics (Admin, HR)',
        'GET /api/payroll/my': 'Get my payroll records (Employee)',
        'GET /api/payroll/summary/:employeeId': 'Get payroll summary (Admin, HR, Employee)',
        'GET /api/payroll/:id': 'Get payroll by ID',
        'POST /api/payroll': 'Generate payroll (Admin, HR)',
        'POST /api/payroll/bulk': 'Generate bulk payroll (Admin, HR)',
        'PUT /api/payroll/:id': 'Update payroll (Admin, HR)',
        'PUT /api/payroll/:id/mark-paid': 'Mark payroll as paid (Admin, HR)',
        'PUT /api/payroll/:id/cancel': 'Cancel payroll (Admin, HR)'
      },
      leaves: {
        'GET /api/leaves': 'Get all leave requests (Admin, HR)',
        'GET /api/leaves/stats': 'Get leave statistics (Admin, HR)',
        'GET /api/leaves/my': 'Get my leave requests (Employee)',
        'GET /api/leaves/:id': 'Get leave by ID',
        'POST /api/leaves': 'Create leave request (Employee)',
        'PUT /api/leaves/:id': 'Update leave request (Employee)',
        'PUT /api/leaves/:id/approve': 'Approve leave request (Admin, HR)',
        'PUT /api/leaves/:id/reject': 'Reject leave request (Admin, HR)',
        'DELETE /api/leaves/:id': 'Delete leave request (Employee)'
      }
    },
    roles: {
      admin: 'Full access to all features',
      hr: 'Access to employee, department, attendance, and payroll management',
      employee: 'Access to own profile and data only'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payroll', payrollRoutes);
router.use('/leaves', leaveRoutes);

module.exports = router;
