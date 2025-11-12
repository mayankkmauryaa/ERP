const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/auth');
const { validateEmployee, validateId, validatePagination } = require('../middleware/validation');

/**
 * @route   GET /api/employees
 * @desc    Get all employees with pagination and filters
 * @access  Private (Admin, HR)
 */
router.get('/',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validatePagination,
  EmployeeController.getAllEmployees
);

/**
 * @route   GET /api/employees/stats
 * @desc    Get employee statistics
 * @access  Private (Admin, HR)
 */
router.get('/stats',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  EmployeeController.getEmployeeStats
);

/**
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Private (Admin, HR, Employee - own data only)
 */
router.get('/:id',
  authenticateToken,
  authorizeEmployeeAccess,
  validateId,
  EmployeeController.getEmployeeById
);

/**
 * @route   POST /api/employees
 * @desc    Create new employee
 * @access  Private (Admin, HR)
 */
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateEmployee,
  EmployeeController.createEmployee
);

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Private (Admin, HR, Employee - own data only)
 */
router.put('/:id',
  authenticateToken,
  authorizeEmployeeAccess,
  validateId,
  EmployeeController.updateEmployee
);

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete employee (soft delete)
 * @access  Private (Admin, HR)
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  EmployeeController.deleteEmployee
);

/**
 * @route   GET /api/employees/profile
 * @desc    Get current employee's own profile
 * @access  Private (Employee)
 */
router.get('/profile',
  authenticateToken,
  EmployeeController.getEmployeeProfile
);

/**
 * @route   GET /api/employees/department/:departmentId
 * @desc    Get employees by department
 * @access  Private (Admin, HR)
 */
router.get('/department/:departmentId',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  validatePagination,
  EmployeeController.getEmployeesByDepartment
);

/**
 * @route   PUT /api/employees/:id/reactivate
 * @desc    Reactivate employee
 * @access  Private (Admin, HR)
 */
router.put('/:id/reactivate',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  EmployeeController.reactivateEmployee
);

module.exports = router;
