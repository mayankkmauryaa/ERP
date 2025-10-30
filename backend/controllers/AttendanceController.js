const { Attendance, Employee, Department } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all attendance records with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { employeeId, startDate, endDate, status, month, year } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Month and year filter
    if (month && year) {
      whereClause.date = {
        [Op.and]: [
          require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('date')), month),
          require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('date')), year)
        ]
      };
    }

    // Get attendance records with pagination
    const { count, rows: attendance } = await Attendance.findAndCountAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }],
      limit,
      offset,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        attendance,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records',
      error: error.message
    });
  }
};

/**
 * Mark attendance for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      where: { employeeId, date }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }

    // Calculate working hours and late status if check-in and check-out are provided
    let workingHours = null;
    let isLate = false;
    let lateMinutes = null;
    let overtimeHours = null;

    if (checkIn && checkOut) {
      const checkInTime = new Date(`2000-01-01T${checkIn}`);
      const checkOutTime = new Date(`2000-01-01T${checkOut}`);
      workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
      
      // Ensure working hours is not negative
      if (workingHours < 0) {
        return res.status(400).json({
          success: false,
          message: 'Check-out time must be after check-in time'
        });
      }

      // Check if employee is late (assuming 9:00 AM is standard start time)
      const standardStartTime = new Date(`2000-01-01T09:00:00`);
      if (checkInTime > standardStartTime) {
        isLate = true;
        lateMinutes = Math.round((checkInTime - standardStartTime) / (1000 * 60));
      }

      // Calculate overtime (assuming 8 hours is standard working time)
      const standardWorkingHours = 8;
      if (workingHours > standardWorkingHours) {
        overtimeHours = workingHours - standardWorkingHours;
      }
    }

    // Create attendance record
    const attendance = await Attendance.create({
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      workingHours,
      notes,
      isLate,
      lateMinutes,
      overtimeHours
    });

    // Get attendance with employee details
    const newAttendance = await Attendance.findByPk(attendance.id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: { attendance: newAttendance }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

/**
 * Update attendance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, notes } = req.body;

    // Check if attendance exists
    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Calculate working hours if check-in and check-out are provided
    let workingHours = attendance.workingHours;
    if (checkIn && checkOut) {
      const checkInTime = new Date(`2000-01-01T${checkIn}`);
      const checkOutTime = new Date(`2000-01-01T${checkOut}`);
      workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      
      if (workingHours < 0) {
        return res.status(400).json({
          success: false,
          message: 'Check-out time must be after check-in time'
        });
      }
    }

    // Update attendance
    await Attendance.update(
      { checkIn, checkOut, status, workingHours, notes },
      { where: { id } }
    );

    // Get updated attendance
    const updatedAttendance = await Attendance.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }]
    });

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: { attendance: updatedAttendance }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance',
      error: error.message
    });
  }
};

/**
 * Get monthly attendance summary for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMonthlySummary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;

    // Validate month and year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    if (yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 2020 and 2030'
      });
    }

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get attendance records for the month
    const attendanceRecords = await Attendance.findAll({
      where: {
        employeeId,
        date: {
          [Op.and]: [
            require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('date')), monthNum),
            require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('date')), yearNum)
          ]
        }
      },
      order: [['date', 'ASC']]
    });

    // Calculate summary statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'late').length;
    const halfDays = attendanceRecords.filter(record => record.status === 'half_day').length;
    
    const totalWorkingHours = attendanceRecords.reduce((sum, record) => {
      return sum + (parseFloat(record.workingHours) || 0);
    }, 0);

    const averageWorkingHours = totalDays > 0 ? totalWorkingHours / totalDays : 0;

    res.json({
      success: true,
      message: 'Monthly attendance summary retrieved successfully',
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          designation: employee.designation
        },
        month: monthNum,
        year: yearNum,
        summary: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          halfDays,
          totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
          averageWorkingHours: parseFloat(averageWorkingHours.toFixed(2))
        },
        attendanceRecords
      }
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve monthly summary',
      error: error.message
    });
  }
};

/**
 * Get attendance statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    // Build date filter
    const dateFilter = {
      [Op.and]: [
        require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('date')), currentMonth),
        require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('date')), currentYear)
      ]
    };

    // Get total attendance records for the month
    const totalRecords = await Attendance.count({
      where: { date: dateFilter }
    });

    // Get attendance by status
    const attendanceByStatus = await Attendance.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { date: dateFilter },
      group: ['status']
    });

    // Get average working hours
    const avgWorkingHours = await Attendance.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('workingHours')), 'avgHours']
      ],
      where: { 
        date: dateFilter,
        workingHours: { [Op.ne]: null }
      }
    });

    res.json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: {
        month: currentMonth,
        year: currentYear,
        totalRecords,
        attendanceByStatus,
        averageWorkingHours: parseFloat(avgWorkingHours?.dataValues?.avgHours || 0)
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance statistics',
      error: error.message
    });
  }
};

/**
 * Get attendance by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation', 'email'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance record retrieved successfully',
      data: { attendance }
    });
  } catch (error) {
    console.error('Get attendance by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance record',
      error: error.message
    });
  }
};

/**
 * Get employee's own attendance records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { startDate, endDate, status, month, year } = req.query;

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

    // Date range filter
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Month and year filter
    if (month && year) {
      whereClause.date = {
        [Op.and]: [
          require('sequelize').where(require('sequelize').fn('MONTH', require('sequelize').col('date')), month),
          require('sequelize').where(require('sequelize').fn('YEAR', require('sequelize').col('date')), year)
        ]
      };
    }

    // Get attendance records with pagination
    const { count, rows: attendance } = await Attendance.findAndCountAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'designation'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }],
      limit,
      offset,
      order: [['date', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Your attendance records retrieved successfully',
      data: {
        attendance,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your attendance records',
      error: error.message
    });
  }
};

/**
 * Check in for the day
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Get employee record for the current user
    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Check if attendance already exists for today
    const existingAttendance = await Attendance.findOne({
      where: { employeeId: employee.id, date: today }
    });

    if (existingAttendance) {
      if (existingAttendance.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'You have already checked in today'
        });
      }

      // Update existing record with check-in
      await Attendance.update(
        { checkIn: currentTime },
        { where: { id: existingAttendance.id } }
      );
    } else {
      // Create new attendance record
      await Attendance.create({
        employeeId: employee.id,
        date: today,
        checkIn: currentTime,
        status: 'present',
        notes
      });
    }

    res.json({
      success: true,
      message: 'Check-in successful',
      data: {
        date: today,
        checkIn: currentTime
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in',
      error: error.message
    });
  }
};

/**
 * Check out for the day
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Get employee record for the current user
    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Get today's attendance record
    const attendance = await Attendance.findOne({
      where: { employeeId: employee.id, date: today }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    // Calculate working hours
    const checkInTime = new Date(`2000-01-01T${attendance.checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${currentTime}`);
    const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    if (workingHours < 0) {
      return res.status(400).json({
        success: false,
        message: 'Check-out time must be after check-in time'
      });
    }

    // Calculate late status and overtime
    let isLate = false;
    let lateMinutes = null;
    let overtimeHours = null;

    const standardStartTime = new Date(`2000-01-01T09:00:00`);
    if (checkInTime > standardStartTime) {
      isLate = true;
      lateMinutes = Math.round((checkInTime - standardStartTime) / (1000 * 60));
    }

    const standardWorkingHours = 8;
    if (workingHours > standardWorkingHours) {
      overtimeHours = workingHours - standardWorkingHours;
    }

    // Update attendance record
    await Attendance.update(
      {
        checkOut: currentTime,
        workingHours: parseFloat(workingHours.toFixed(2)),
        isLate,
        lateMinutes,
        overtimeHours,
        notes: notes || attendance.notes
      },
      { where: { id: attendance.id } }
    );

    res.json({
      success: true,
      message: 'Check-out successful',
      data: {
        date: today,
        checkIn: attendance.checkIn,
        checkOut: currentTime,
        workingHours: parseFloat(workingHours.toFixed(2)),
        isLate,
        lateMinutes,
        overtimeHours
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out',
      error: error.message
    });
  }
};

/**
 * Get today's attendance status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get employee record for the current user
    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Get today's attendance record
    const attendance = await Attendance.findOne({
      where: { employeeId: employee.id, date: today }
    });

    if (!attendance) {
      return res.json({
        success: true,
        message: 'No attendance record for today',
        data: {
          date: today,
          status: 'not_marked',
          checkIn: null,
          checkOut: null,
          workingHours: null
        }
      });
    }

    res.json({
      success: true,
      message: 'Today\'s attendance status retrieved successfully',
      data: {
        date: today,
        status: attendance.status,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        workingHours: attendance.workingHours,
        isLate: attendance.isLate,
        lateMinutes: attendance.lateMinutes,
        overtimeHours: attendance.overtimeHours,
        notes: attendance.notes
      }
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve today\'s status',
      error: error.message
    });
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  getMonthlySummary,
  getAttendanceStats,
  getMyAttendance,
  checkIn,
  checkOut,
  getTodayStatus
};
