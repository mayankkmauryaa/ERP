const { Payroll, Employee, Department, Leave, Attendance, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculate leave deductions for an employee for a specific month/year
 * @param {number} employeeId - Employee ID
 * @param {number} month - Month
 * @param {number} year - Year
 * @returns {Promise<number>} Total leave deductions
 */
const calculateLeaveDeductions = async (employeeId, month, year) => {
  try {
    // Get all approved leaves for the month
    const leaves = await Leave.findAll({
      where: {
        employeeId,
        status: 'approved',
        startDate: {
          [Op.and]: [
            require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('startDate')), month),
            require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('startDate')), year)
          ]
        }
      }
    });

    // Get employee's daily salary
    const employee = await Employee.findByPk(employeeId);
    const dailySalary = parseFloat(employee.salary) / 30; // Assuming 30 days per month

    // Calculate deductions for each leave
    let totalDeductions = 0;
    for (const leave of leaves) {
      // Only deduct for unpaid leave types (exclude vacation, personal, etc.)
      if (['sick', 'emergency'].includes(leave.leaveType)) {
        totalDeductions += leave.totalDays * dailySalary;
      }
    }

    return totalDeductions;
  } catch (error) {
    console.error('Calculate leave deductions error:', error);
    return 0;
  }
};

/**
 * Calculate attendance bonus for an employee for a specific month/year
 * @param {number} employeeId - Employee ID
 * @param {number} month - Month
 * @param {number} year - Year
 * @returns {Promise<number>} Total attendance bonus
 */
const calculateAttendanceBonus = async (employeeId, month, year) => {
  try {
    // Get attendance records for the month
    const attendanceRecords = await Attendance.findAll({
      where: {
        employeeId,
        date: {
          [Op.and]: [
            require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('date')), month),
            require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('date')), year)
          ]
        }
      }
    });

    // Calculate bonus based on attendance
    let totalBonus = 0;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const totalWorkingDays = attendanceRecords.length;
    
    if (totalWorkingDays > 0) {
      const attendancePercentage = (presentDays / totalWorkingDays) * 100;
      
      // Bonus for perfect attendance (100%)
      if (attendancePercentage === 100) {
        totalBonus = 500; // $500 bonus for perfect attendance
      }
      // Bonus for good attendance (90%+)
      else if (attendancePercentage >= 90) {
        totalBonus = 200; // $200 bonus for good attendance
      }
    }

    return totalBonus;
  } catch (error) {
    console.error('Calculate attendance bonus error:', error);
    return 0;
  }
};

/**
 * Get all payroll records with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPayrolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { employeeId, month, year, status } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (month) {
      whereClause.month = month;
    }

    if (year) {
      whereClause.year = year;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get payroll records with pagination
    const { count, rows: payrolls } = await Payroll.findAndCountAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation', 'salary'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }],
      limit,
      offset,
      order: [['year', 'DESC'], ['month', 'DESC'], ['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Payroll records retrieved successfully',
      data: {
        payrolls,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payroll records',
      error: error.message
    });
  }
};

/**
 * Get payroll by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation', 'salary'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    res.json({
      success: true,
      message: 'Payroll record retrieved successfully',
      data: { payroll }
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payroll record',
      error: error.message
    });
  }
};

/**
 * Generate payroll for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generatePayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      baseSalary,
      bonus = 0,
      overtime = 0,
      allowances = 0,
      deductions = 0,
      notes
    } = req.body;

    const generatedBy = req.user.id;

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if payroll already exists for this employee and month/year
    const existingPayroll = await Payroll.findOne({
      where: { employeeId, month, year }
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this employee and month/year'
      });
    }

    // Calculate leave deductions for the month
    const leaveDeductions = await calculateLeaveDeductions(employeeId, month, year);
    
    // Calculate attendance bonus for the month
    const attendanceBonus = await calculateAttendanceBonus(employeeId, month, year);

    // Calculate total pay
    const totalPay = parseFloat(baseSalary) + parseFloat(bonus) + 
                    parseFloat(overtime) + parseFloat(allowances) + parseFloat(attendanceBonus) - 
                    parseFloat(deductions) - parseFloat(leaveDeductions);

    // Create payroll record
    const payroll = await Payroll.create({
      employeeId,
      month,
      year,
      baseSalary,
      bonus,
      overtime,
      allowances,
      deductions,
      leaveDeductions,
      attendanceBonus,
      totalPay,
      notes,
      generatedBy,
      generatedAt: new Date()
    });

    // Get payroll with employee details
    const newPayroll = await Payroll.findByPk(payroll.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'designation', 'salary'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        },
        {
          model: User,
          as: 'generatedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: { payroll: newPayroll }
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payroll',
      error: error.message
    });
  }
};

/**
 * Update payroll record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if payroll exists
    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Recalculate total pay if financial fields are updated
    if (updateData.baseSalary || updateData.bonus || updateData.overtime || 
        updateData.allowances || updateData.deductions) {
      
      const baseSalary = parseFloat(updateData.baseSalary || payroll.baseSalary);
      const bonus = parseFloat(updateData.bonus || payroll.bonus);
      const overtime = parseFloat(updateData.overtime || payroll.overtime);
      const allowances = parseFloat(updateData.allowances || payroll.allowances);
      const deductions = parseFloat(updateData.deductions || payroll.deductions);
      
      updateData.totalPay = baseSalary + bonus + overtime + allowances - deductions;
    }

    // Update payroll
    await Payroll.update(updateData, { where: { id } });

    // Get updated payroll
    const updatedPayroll = await Payroll.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation', 'salary'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }]
    });

    res.json({
      success: true,
      message: 'Payroll updated successfully',
      data: { payroll: updatedPayroll }
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payroll',
      error: error.message
    });
  }
};

/**
 * Mark payroll as paid
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markPayrollAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate } = req.body;
    const paidBy = req.user.id;

    // Check if payroll exists
    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Update payroll status and payment date
    await Payroll.update(
      { 
        status: 'paid',
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        paidBy,
        paidAt: new Date()
      },
      { where: { id } }
    );

    // Get updated payroll
    const updatedPayroll = await Payroll.findByPk(id, {
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
          as: 'paidByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      message: 'Payroll marked as paid successfully',
      data: { payroll: updatedPayroll }
    });
  } catch (error) {
    console.error('Mark payroll as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark payroll as paid',
      error: error.message
    });
  }
};

/**
 * Get payroll statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPayrollStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    // Build where clause
    const whereClause = { month: currentMonth, year: currentYear };

    // Get total payroll records for the month
    const totalPayrolls = await Payroll.count({ where: whereClause });

    // Get payroll by status
    const payrollByStatus = await Payroll.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: whereClause,
      group: ['status']
    });

    // Get total amount paid
    const totalAmountResult = await Payroll.findOne({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('totalPay')), 'totalAmount']
      ],
      where: { ...whereClause, status: 'paid' }
    });

    // Get average salary
    const avgSalaryResult = await Payroll.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('totalPay')), 'avgSalary']
      ],
      where: whereClause
    });

    res.json({
      success: true,
      message: 'Payroll statistics retrieved successfully',
      data: {
        month: currentMonth,
        year: currentYear,
        totalPayrolls,
        payrollByStatus,
        totalAmountPaid: parseFloat(totalAmountResult?.dataValues?.totalAmount || 0),
        averageSalary: parseFloat(avgSalaryResult?.dataValues?.avgSalary || 0)
      }
    });
  } catch (error) {
    console.error('Get payroll stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payroll statistics',
      error: error.message
    });
  }
};

/**
 * Generate bulk payroll for all employees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateBulkPayroll = async (req, res) => {
  try {
    const { month, year, bonus = 0, overtime = 0, allowances = 0, deductions = 0 } = req.body;

    // Get all active employees
    const employees = await Employee.findAll({
      where: { isActive: true },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees found'
      });
    }

    const generatedPayrolls = [];
    const errors = [];

    // Generate payroll for each employee
    for (const employee of employees) {
      try {
        // Check if payroll already exists
        const existingPayroll = await Payroll.findOne({
          where: { employeeId: employee.id, month, year }
        });

        if (existingPayroll) {
          errors.push(`Payroll already exists for ${employee.name}`);
          continue;
        }

        // Calculate total pay
        const totalPay = parseFloat(employee.salary) + parseFloat(bonus) + 
                        parseFloat(overtime) + parseFloat(allowances) - parseFloat(deductions);

        // Create payroll record
        const payroll = await Payroll.create({
          employeeId: employee.id,
          month,
          year,
          baseSalary: employee.salary,
          bonus,
          overtime,
          allowances,
          deductions,
          totalPay
        });

        generatedPayrolls.push(payroll);
      } catch (error) {
        errors.push(`Failed to generate payroll for ${employee.name}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Bulk payroll generation completed',
      data: {
        generatedCount: generatedPayrolls.length,
        totalEmployees: employees.length,
        generatedPayrolls,
        errors
      }
    });
  } catch (error) {
    console.error('Generate bulk payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulk payroll',
      error: error.message
    });
  }
};

/**
 * Get employee's own payroll records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyPayrolls = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { month, year, status } = req.query;

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
    
    if (month) {
      whereClause.month = month;
    }

    if (year) {
      whereClause.year = year;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get payroll records with pagination
    const { count, rows: payrolls } = await Payroll.findAndCountAll({
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
          as: 'generatedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'paidByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Your payroll records retrieved successfully',
      data: {
        payrolls,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get my payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your payroll records',
      error: error.message
    });
  }
};

/**
 * Get payroll summary for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPayrollSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get all payroll records for the year
    const payrolls = await Payroll.findAll({
      where: {
        employeeId,
        year: currentYear
      },
      order: [['month', 'ASC']]
    });

    // Calculate summary statistics
    const totalPay = payrolls.reduce((sum, payroll) => sum + parseFloat(payroll.totalPay), 0);
    const paidPayrolls = payrolls.filter(payroll => payroll.status === 'paid');
    const pendingPayrolls = payrolls.filter(payroll => payroll.status === 'pending');
    const totalPaid = paidPayrolls.reduce((sum, payroll) => sum + parseFloat(payroll.totalPay), 0);
    const averageMonthlyPay = payrolls.length > 0 ? totalPay / payrolls.length : 0;

    res.json({
      success: true,
      message: 'Payroll summary retrieved successfully',
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          designation: employee.designation
        },
        year: currentYear,
        summary: {
          totalPayrolls: payrolls.length,
          paidPayrolls: paidPayrolls.length,
          pendingPayrolls: pendingPayrolls.length,
          totalPay: parseFloat(totalPay.toFixed(2)),
          totalPaid: parseFloat(totalPaid.toFixed(2)),
          averageMonthlyPay: parseFloat(averageMonthlyPay.toFixed(2))
        },
        monthlyBreakdown: payrolls.map(payroll => ({
          month: payroll.month,
          year: payroll.year,
          baseSalary: payroll.baseSalary,
          bonus: payroll.bonus,
          overtime: payroll.overtime,
          allowances: payroll.allowances,
          deductions: payroll.deductions,
          leaveDeductions: payroll.leaveDeductions,
          attendanceBonus: payroll.attendanceBonus,
          totalPay: payroll.totalPay,
          status: payroll.status,
          paymentDate: payroll.paymentDate
        }))
      }
    });
  } catch (error) {
    console.error('Get payroll summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payroll summary',
      error: error.message
    });
  }
};

/**
 * Cancel payroll record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if payroll exists
    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Check if payroll is already paid
    if (payroll.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a paid payroll record'
      });
    }

    // Update payroll status
    await Payroll.update(
      { 
        status: 'cancelled',
        notes: reason || payroll.notes
      },
      { where: { id } }
    );

    // Get updated payroll
    const updatedPayroll = await Payroll.findByPk(id, {
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
        }
      ]
    });

    res.json({
      success: true,
      message: 'Payroll cancelled successfully',
      data: { payroll: updatedPayroll }
    });
  } catch (error) {
    console.error('Cancel payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel payroll',
      error: error.message
    });
  }
};

module.exports = {
  getAllPayrolls,
  getPayrollById,
  generatePayroll,
  updatePayroll,
  markPayrollAsPaid,
  getPayrollStats,
  generateBulkPayroll,
  getMyPayrolls,
  getPayrollSummary,
  cancelPayroll
};
