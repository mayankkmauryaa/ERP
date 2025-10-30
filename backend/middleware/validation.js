const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'hr', 'employee'])
    .withMessage('Role must be admin, hr, or employee'),
  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Employee validation
 */
const validateEmployee = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone must be between 10 and 20 characters'),
  body('designation')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
  body('salary')
    .isDecimal()
    .withMessage('Salary must be a valid decimal number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Salary must be a positive number');
      }
      return true;
    }),
  body('joiningDate')
    .isISO8601()
    .withMessage('Joining date must be a valid date'),
  body('departmentId')
    .isInt()
    .withMessage('Department ID must be a valid integer'),
  body('userId')
    .isInt()
    .withMessage('User ID must be a valid integer'),
  handleValidationErrors
];

/**
 * Department validation
 */
const validateDepartment = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

/**
 * Attendance validation
 */
const validateAttendance = [
  body('employeeId')
    .isInt()
    .withMessage('Employee ID must be a valid integer'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('checkIn')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Check-in time must be in HH:MM format'),
  body('checkOut')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Check-out time must be in HH:MM format'),
  body('status')
    .optional()
    .isIn(['present', 'absent', 'late', 'half_day'])
    .withMessage('Status must be present, absent, late, or half_day'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

/**
 * Check-in validation
 */
const validateCheckIn = [
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

/**
 * Check-out validation
 */
const validateCheckOut = [
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

/**
 * Leave validation
 */
const validateLeave = [
  body('employeeId')
    .isInt()
    .withMessage('Employee ID must be a valid integer'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0];
      if (new Date(value) < new Date(today)) {
        throw new Error('Start date must be today or later');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0];
      if (new Date(value) < new Date(today)) {
        throw new Error('End date must be today or later');
      }
      return true;
    }),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
  body('leaveType')
    .optional()
    .isIn(['sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'other'])
    .withMessage('Leave type must be one of: sick, vacation, personal, maternity, paternity, emergency, other'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

/**
 * Leave approval validation
 */
const validateLeaveApproval = [
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

/**
 * Leave rejection validation
 */
const validateLeaveRejection = [
  body('rejectionReason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
  handleValidationErrors
];

/**
 * Payroll validation
 */
const validatePayroll = [
  body('employeeId')
    .isInt()
    .withMessage('Employee ID must be a valid integer'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('baseSalary')
    .isDecimal()
    .withMessage('Base salary must be a valid decimal number'),
  body('bonus')
    .optional()
    .isDecimal()
    .withMessage('Bonus must be a valid decimal number'),
  body('overtime')
    .optional()
    .isDecimal()
    .withMessage('Overtime must be a valid decimal number'),
  body('allowances')
    .optional()
    .isDecimal()
    .withMessage('Allowances must be a valid decimal number'),
  body('deductions')
    .optional()
    .isDecimal()
    .withMessage('Deductions must be a valid decimal number'),
  handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateId = [
  param('id')
    .isInt()
    .withMessage('ID must be a valid integer'),
  handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateEmployee,
  validateDepartment,
  validateAttendance,
  validateCheckIn,
  validateCheckOut,
  validateLeave,
  validateLeaveApproval,
  validateLeaveRejection,
  validatePayroll,
  validateId,
  validatePagination
};
