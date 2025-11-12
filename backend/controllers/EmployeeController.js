const { Employee, Department, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all employees with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, departmentId, isActive } = req.query;

    // Build where clause
    const whereClause = {};
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // Build search conditions
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { designation: { [Op.like]: `%${search}%` } }
      );
    }

    if (searchConditions.length > 0) {
      whereClause[Op.or] = searchConditions;
    }

    // Department filter
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    // Get employees with pagination
    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'isActive']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Employees retrieved successfully',
      data: {
        employees,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees',
      error: error.message
    });
  }
};

/**
 * Get employee by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'isActive']
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee retrieved successfully',
      data: { employee }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee',
      error: error.message
    });
  }
};

/**
 * Create new employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      designation,
      salary,
      joiningDate,
      departmentId,
      userId
    } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has an employee record
    const existingEmployee = await Employee.findOne({ where: { userId } });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'User already has an employee record'
      });
    }

    // Check if email is already taken
    const emailExists = await Employee.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken by another employee'
      });
    }

    // Check if department exists
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Create employee
    const employee = await Employee.create({
      name,
      email,
      phone,
      address,
      designation,
      salary,
      joiningDate,
      departmentId,
      userId
    });

    // Get employee with relations
    const newEmployee = await Employee.findByPk(employee.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee: newEmployee }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

/**
 * Update employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if employee exists
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if email is already taken by another employee
    if (updateData.email && updateData.email !== employee.email) {
      const emailExists = await Employee.findOne({
        where: { email: updateData.email, id: { [Op.ne]: id } }
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another employee'
        });
      }
    }

    // Check if department exists
    if (updateData.departmentId) {
      const department = await Department.findByPk(updateData.departmentId);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    // Update employee
    await Employee.update(updateData, { where: { id } });

    // Get updated employee
    const updatedEmployee = await Employee.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee: updatedEmployee }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

/**
 * Delete employee (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Soft delete - set isActive to false
    await Employee.update({ isActive: false }, { where: { id } });

    res.json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};

/**
 * Get employee statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { isActive: true } });
    const inactiveEmployees = totalEmployees - activeEmployees;

    // Get employees by department
    const employeesByDepartment = await Employee.findAll({
      attributes: [
        'departmentId',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      include: [{
        model: Department,
        as: 'department',
        attributes: ['name']
      }],
      group: ['departmentId', 'department.id'],
      where: { isActive: true }
    });

    // Get average salary
    const avgSalaryResult = await Employee.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('salary')), 'avgSalary']
      ],
      where: { isActive: true }
    });

    // Get salary statistics
    const salaryStats = await Employee.findOne({
      attributes: [
        [require('sequelize').fn('MIN', require('sequelize').col('salary')), 'minSalary'],
        [require('sequelize').fn('MAX', require('sequelize').col('salary')), 'maxSalary'],
        [require('sequelize').fn('AVG', require('sequelize').col('salary')), 'avgSalary']
      ],
      where: { isActive: true }
    });

    // Get employees by designation
    const employeesByDesignation = await Employee.findAll({
      attributes: [
        'designation',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['designation'],
      where: { isActive: true },
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    });

    res.json({
      success: true,
      message: 'Employee statistics retrieved successfully',
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByDepartment,
        employeesByDesignation,
        salaryStatistics: {
          average: parseFloat(avgSalaryResult?.dataValues?.avgSalary || 0),
          minimum: parseFloat(salaryStats?.dataValues?.minSalary || 0),
          maximum: parseFloat(salaryStats?.dataValues?.maxSalary || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee statistics',
      error: error.message
    });
  }
};

/**
 * Get employees by department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if department exists
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: {
        departmentId,
        isActive: true
      },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'isActive']
        }
      ],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: `Employees in ${department.name} department retrieved successfully`,
      data: {
        department: {
          id: department.id,
          name: department.name,
          description: department.description
        },
        employees,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get employees by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees by department',
      error: error.message
    });
  }
};

/**
 * Reactivate employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (employee.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already active'
      });
    }

    // Reactivate employee
    await Employee.update({ isActive: true }, { where: { id } });

    // Get updated employee
    const reactivatedEmployee = await Employee.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Employee reactivated successfully',
      data: { employee: reactivatedEmployee }
    });
  } catch (error) {
    console.error('Reactivate employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate employee',
      error: error.message
    });
  }
};

/**
 * Get employee profile (for employees to view their own data)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmployeeProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await Employee.findOne({
      where: { userId },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'isActive']
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee profile retrieved successfully',
      data: { employee }
    });
  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee profile',
      error: error.message
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getEmployeesByDepartment,
  reactivateEmployee,
  getEmployeeProfile
};
