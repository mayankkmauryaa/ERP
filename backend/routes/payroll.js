const express = require('express');
const router = express.Router();
const PayrollController = require('../controllers/PayrollController');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/auth');
const { validatePayroll, validateId, validatePagination } = require('../middleware/validation');

/**
 * @route   GET /api/payroll
 * @desc    Get all payroll records with pagination and filters
 * @access  Private (Admin, HR)
 */
router.get('/',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validatePagination,
  PayrollController.getAllPayrolls
);

/**
 * @route   GET /api/payroll/stats
 * @desc    Get payroll statistics
 * @access  Private (Admin, HR)
 */
router.get('/stats',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  PayrollController.getPayrollStats
);

/**
 * @route   GET /api/payroll/:id
 * @desc    Get payroll by ID
 * @access  Private (Admin, HR, Employee - own data only)
 */
router.get('/:id',
  authenticateToken,
  authorizeEmployeeAccess,
  validateId,
  PayrollController.getPayrollById
);

/**
 * @route   POST /api/payroll
 * @desc    Generate payroll for an employee
 * @access  Private (Admin, HR)
 */
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validatePayroll,
  PayrollController.generatePayroll
);

/**
 * @route   POST /api/payroll/bulk
 * @desc    Generate bulk payroll for all employees
 * @access  Private (Admin, HR)
 */
router.post('/bulk',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  PayrollController.generateBulkPayroll
);

/**
 * @route   PUT /api/payroll/:id
 * @desc    Update payroll record
 * @access  Private (Admin, HR)
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  PayrollController.updatePayroll
);

/**
 * @route   PUT /api/payroll/:id/mark-paid
 * @desc    Mark payroll as paid
 * @access  Private (Admin, HR)
 */
router.put('/:id/mark-paid',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  PayrollController.markPayrollAsPaid
);

/**
 * @route   GET /api/payroll/my
 * @desc    Get current employee's payroll records
 * @access  Private (Employee)
 */
router.get('/my',
  authenticateToken,
  validatePagination,
  PayrollController.getMyPayrolls
);

/**
 * @route   GET /api/payroll/summary/:employeeId
 * @desc    Get payroll summary for an employee
 * @access  Private (Admin, HR, Employee - own data only)
 */
router.get('/summary/:employeeId',
  authenticateToken,
  authorizeEmployeeAccess,
  validateId,
  PayrollController.getPayrollSummary
);

/**
 * @route   PUT /api/payroll/:id/cancel
 * @desc    Cancel payroll record
 * @access  Private (Admin, HR)
 */
router.put('/:id/cancel',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  PayrollController.cancelPayroll
);

module.exports = router;
