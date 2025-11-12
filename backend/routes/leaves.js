const express = require('express');
const router = express.Router();
const LeaveController = require('../controllers/LeaveController');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/auth');
const { validateLeave, validateLeaveApproval, validateLeaveRejection, validateId, validatePagination } = require('../middleware/validation');

/**
 * @route   GET /api/leaves
 * @desc    Get all leave requests with pagination and filters
 * @access  Private (Admin, HR)
 */
router.get('/',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validatePagination,
  LeaveController.getAllLeaves
);

/**
 * @route   GET /api/leaves/stats
 * @desc    Get leave statistics
 * @access  Private (Admin, HR)
 */
router.get('/stats',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  LeaveController.getLeaveStats
);

/**
 * @route   GET /api/leaves/my
 * @desc    Get current employee's leave requests
 * @access  Private (Employee)
 */
router.get('/my',
  authenticateToken,
  validatePagination,
  LeaveController.getMyLeaves
);

/**
 * @route   GET /api/leaves/:id
 * @desc    Get leave request by ID
 * @access  Private (Admin, HR, Employee - own data only)
 */
router.get('/:id',
  authenticateToken,
  authorizeEmployeeAccess,
  validateId,
  LeaveController.getLeaveById
);

/**
 * @route   POST /api/leaves
 * @desc    Create new leave request
 * @access  Private (Employee)
 */
router.post('/',
  authenticateToken,
  validateLeave,
  LeaveController.createLeave
);

/**
 * @route   PUT /api/leaves/:id
 * @desc    Update leave request (only if pending)
 * @access  Private (Employee - own data only)
 */
router.put('/:id',
  authenticateToken,
  authorizeEmployeeAccess,
  validateId,
  LeaveController.updateLeave
);

/**
 * @route   PUT /api/leaves/:id/approve
 * @desc    Approve leave request
 * @access  Private (Admin, HR)
 */
router.put('/:id/approve',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  validateLeaveApproval,
  LeaveController.approveLeave
);

/**
 * @route   PUT /api/leaves/:id/reject
 * @desc    Reject leave request
 * @access  Private (Admin, HR)
 */
router.put('/:id/reject',
  authenticateToken,
  authorizeRoles('admin', 'hr'),
  validateId,
  validateLeaveRejection,
  LeaveController.rejectLeave
);

/**
 * @route   DELETE /api/leaves/:id
 * @desc    Delete leave request (only if pending)
 * @access  Private (Employee - own data only)
 */
router.delete('/:id',
  authenticateToken,
  authorizeEmployeeAccess,
  validateId,
  LeaveController.deleteLeave
);

module.exports = router;
