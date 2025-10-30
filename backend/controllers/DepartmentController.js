const { Department, Employee } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all departments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, isActive } = req.query;

    // Build where clause
    const whereClause = {};
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get departments with pagination
    const { count, rows: departments } = await Department.findAndCountAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'employees',
        attributes: ['id', 'name', 'designation'],
        where: { isActive: true },
        required: false
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Departments retrieved successfully',
      data: {
        departments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments',
      error: error.message
    });
  }
};

/**
 * Get department by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employees',
        attributes: ['id', 'name', 'email', 'designation', 'salary', 'joiningDate'],
        where: { isActive: true },
        required: false
      }]
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department retrieved successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve department',
      error: error.message
    });
  }
};

/**
 * Create new department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if department name already exists
    const existingDepartment = await Department.findOne({ where: { name } });
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Create department
    const department = await Department.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
};

/**
 * Update department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if department exists
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if name is already taken by another department
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({
        where: { name, id: { [Op.ne]: id } }
      });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department name is already taken'
        });
      }
    }

    // Update department
    await Department.update(
      { name, description },
      { where: { id } }
    );

    // Get updated department
    const updatedDepartment = await Department.findByPk(id);

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department: updatedDepartment }
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
};

/**
 * Delete department (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active employees
    const activeEmployees = await Employee.count({
      where: { departmentId: id, isActive: true }
    });

    if (activeEmployees > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. It has ${activeEmployees} active employee(s).`
      });
    }

    // Soft delete - set isActive to false
    await Department.update({ isActive: false }, { where: { id } });

    res.json({
      success: true,
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message
    });
  }
};

/**
 * Get department statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDepartmentStats = async (req, res) => {
  try {
    const totalDepartments = await Department.count();
    const activeDepartments = await Department.count({ where: { isActive: true } });
    const inactiveDepartments = totalDepartments - activeDepartments;

    // Get employee count per department
    const employeesPerDepartment = await Department.findAll({
      attributes: [
        'id',
        'name',
        [require('sequelize').fn('COUNT', require('sequelize').col('employees.id')), 'employeeCount']
      ],
      include: [{
        model: Employee,
        as: 'employees',
        attributes: [],
        where: { isActive: true },
        required: false
      }],
      group: ['Department.id'],
      where: { isActive: true }
    });

    res.json({
      success: true,
      message: 'Department statistics retrieved successfully',
      data: {
        totalDepartments,
        activeDepartments,
        inactiveDepartments,
        employeesPerDepartment
      }
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve department statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
};
