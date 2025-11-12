const { Leave, Employee, User, Department } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all leave requests with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllLeaves = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { employeeId, status, leaveType, startDate, endDate, month, year } = req.query;

    // Build where clause
    const whereClause = {};

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (leaveType) {
      whereClause.leaveType = leaveType;
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.startDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Month and year filter
    if (month && year) {
      whereClause.startDate = {
        [Op.and]: [
          require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('startDate')), month),
          require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('startDate')), year)
        ]
      };
    }

    // Get leave requests with pagination
    const { count, rows: leaves } = await Leave.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation', 'email'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        },
        {
          model: User,
          as: 'approvedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: {
        leaves,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave requests',
      error: error.message
    });
  }
};

/**
 * Get leave request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation', 'email', 'phone'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name', 'description']
          }]
        },
        {
          model: User,
          as: 'approvedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.json({
      success: true,
      message: 'Leave request retrieved successfully',
      data: { leave }
    });
  } catch (error) {
    console.error('Get leave by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave request',
      error: error.message
    });
  }
};

/**
 * Create new leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLeave = async (req, res) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
      reason,
      leaveType,
      notes
    } = req.body;

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before or equal to end date'
      });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      where: {
        employeeId,
        status: ['pending', 'approved'],
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      }
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for this period'
      });
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Create leave request
    const leave = await Leave.create({
      employeeId,
      startDate,
      endDate,
      reason,
      leaveType,
      totalDays,
      notes
    });

    // Get leave with relations
    const newLeave = await Leave.findByPk(leave.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation', 'email'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: { leave: newLeave }
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request',
      error: error.message
    });
  }
};

/**
 * Update leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if leave exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if leave is already approved or rejected
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update approved or rejected leave request'
      });
    }

    // Validate date range if dates are being updated
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) > new Date(updateData.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be before or equal to end date'
        });
      }

      // Recalculate total days
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      updateData.totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Update leave request
    await Leave.update(updateData, { where: { id } });

    // Get updated leave
    const updatedLeave = await Leave.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation', 'email'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Leave request updated successfully',
      data: { leave: updatedLeave }
    });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave request',
      error: error.message
    });
  }
};

/**
 * Approve leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const approvedBy = req.user.id;

    // Check if leave exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if leave is already processed
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leave.status}`
      });
    }

    // Approve leave request
    await Leave.update(
      {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        notes: notes || leave.notes
      },
      { where: { id } }
    );

    // Get updated leave
    const approvedLeave = await Leave.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation', 'email'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        },
        {
          model: User,
          as: 'approvedByUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Leave request approved successfully',
      data: { leave: approvedLeave }
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve leave request',
      error: error.message
    });
  }
};

/**
 * Reject leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const rejectedBy = req.user.id;

    // Check if leave exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if leave is already processed
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leave.status}`
      });
    }

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required and must be at least 10 characters'
      });
    }

    // Reject leave request
    await Leave.update(
      {
        status: 'rejected',
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        rejectionReason
      },
      { where: { id } }
    );

    // Get updated leave
    const rejectedLeave = await Leave.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation', 'email'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        },
        {
          model: User,
          as: 'approvedByUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Leave request rejected successfully',
      data: { leave: rejectedLeave }
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject leave request',
      error: error.message
    });
  }
};

/**
 * Get employee's own leave requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, leaveType, startDate, endDate } = req.query;

    // Get employee record for the current user
    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Build where clause
    const whereClause = { employeeId: employee.id };

    if (status) {
      whereClause.status = status;
    }

    if (leaveType) {
      whereClause.leaveType = leaveType;
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.startDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get leave requests with pagination
    const { count, rows: leaves } = await Leave.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        },
        {
          model: User,
          as: 'approvedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Your leave requests retrieved successfully',
      data: {
        leaves,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your leave requests',
      error: error.message
    });
  }
};

/**
 * Get leave statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLeaveStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    // Build date filter
    const dateFilter = {
      [Op.and]: [
        require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('startDate')), currentMonth),
        require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('startDate')), currentYear)
      ]
    };

    // Get total leave requests for the month
    const totalLeaves = await Leave.count({
      where: { startDate: dateFilter }
    });

    // Get leaves by status
    const leavesByStatus = await Leave.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { startDate: dateFilter },
      group: ['status']
    });

    // Get leaves by type
    const leavesByType = await Leave.findAll({
      attributes: [
        'leaveType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { startDate: dateFilter },
      group: ['leaveType']
    });

    // Get average leave duration
    const avgDuration = await Leave.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('totalDays')), 'avgDays']
      ],
      where: {
        startDate: dateFilter,
        status: 'approved'
      }
    });

    res.json({
      success: true,
      message: 'Leave statistics retrieved successfully',
      data: {
        month: currentMonth,
        year: currentYear,
        totalLeaves,
        leavesByStatus,
        leavesByType,
        averageDuration: parseFloat(avgDuration?.dataValues?.avgDays || 0)
      }
    });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave statistics',
      error: error.message
    });
  }
};

/**
 * Delete leave request (only if pending)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if leave is already processed
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved or rejected leave request'
      });
    }

    // Delete leave request
    await Leave.destroy({ where: { id } });

    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave request',
      error: error.message
    });
  }
};

module.exports = {
  getAllLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  approveLeave,
  rejectLeave,
  getMyLeaves,
  getLeaveStats,
  deleteLeave
};
