const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/AttendanceController');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/auth');
const { validateAttendance, validateCheckIn, validateCheckOut, validateId, validatePagination } = require('../middleware/validation');

/**
 * @route   GET /api/attendance
 * @desc    Get all attendance records with pagination and filters
 * @access  Private (Admin, HR)
 */
router.get('/',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validatePagination,
  AttendanceController.getAllAttendance
);

/**
 * @route   GET /api/attendance/stats
 * @desc    Get attendance statistics
 * @access  Private (Admin, HR)
 */
router.get('/stats',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  AttendanceController.getAttendanceStats
);

/**
 * @route   GET /api/attendance/monthly/:employeeId/:month/:year
 * @desc    Get monthly attendance summary for an employee
 * @access  Private (Admin, HR, Employee - own data only)
 */
router.get('/monthly/:employeeId/:month/:year',
  authenticateToken,
  authorizeEmployeeAccess,
  AttendanceController.getMonthlySummary
);

/**
 * @route   POST /api/attendance
 * @desc    Mark attendance for an employee
 * @access  Private (Admin, HR)
 */
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateAttendance,
  AttendanceController.markAttendance
);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (Admin, HR)
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  AttendanceController.updateAttendance
);

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private (Admin, HR)
 */
router.get('/:id',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  AttendanceController.getAttendanceById
);

/**
 * @route   GET /api/attendance/my/records
 * @desc    Get current employee's attendance records
 * @access  Private (Employee)
 */
router.get('/my/records',
  authenticateToken,
  validatePagination,
  AttendanceController.getMyAttendance
);

/**
 * @route   GET /api/attendance/my/today
 * @desc    Get today's attendance status for current employee
 * @access  Private (Employee)
 */
router.get('/my/today',
  authenticateToken,
  AttendanceController.getTodayStatus
);

/**
 * @route   POST /api/attendance/checkin
 * @desc    Check in for the day
 * @access  Private (Employee)
 */
router.post('/checkin',
  authenticateToken,
  validateCheckIn,
  AttendanceController.checkIn
);

/**
 * @route   POST /api/attendance/checkout
 * @desc    Check out for the day
 * @access  Private (Employee)
 */
router.post('/checkout',
  authenticateToken,
  validateCheckOut,
  AttendanceController.checkOut
);

module.exports = router;
