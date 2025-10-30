const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/DepartmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDepartment, validateId, validatePagination } = require('../middleware/validation');

/**
 * @route   GET /api/departments
 * @desc    Get all departments with pagination and filters
 * @access  Private (Admin, HR)
 */
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin', 'hr'), 
  validatePagination,
  DepartmentController.getAllDepartments
);

/**
 * @route   GET /api/departments/stats
 * @desc    Get department statistics
 * @access  Private (Admin, HR)
 */
router.get('/stats', 
  authenticateToken, 
  authorizeRoles('admin', 'hr'), 
  DepartmentController.getDepartmentStats
);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Private (Admin, HR)
 */
router.get('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'hr'), 
  validateId,
  DepartmentController.getDepartmentById
);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin, HR)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'hr'), 
  validateDepartment,
  DepartmentController.createDepartment
);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (Admin, HR)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'hr'), 
  validateId,
  DepartmentController.updateDepartment
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete)
 * @access  Private (Admin, HR)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'hr'), 
  validateId,
  DepartmentController.deleteDepartment
);

module.exports = router;
