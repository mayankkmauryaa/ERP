const { dbConfig } = require('../config/database');

// Import all model factories
const UserFactory = require('./User');
const DepartmentFactory = require('./Department');
const EmployeeFactory = require('./Employee');
const AttendanceFactory = require('./Attendance');
const PayrollFactory = require('./Payroll');
const LeaveFactory = require('./Leave');

// Initialize models with sequelize instance
let User, Department, Employee, Attendance, Payroll, Leave;

const initializeModels = () => {
  const sequelize = dbConfig.getSequelize();

  User = UserFactory(sequelize);
  Department = DepartmentFactory(sequelize);
  Employee = EmployeeFactory(sequelize);
  Attendance = AttendanceFactory(sequelize);
  Payroll = PayrollFactory(sequelize);
  Leave = LeaveFactory(sequelize);
};

// Define associations
const defineAssociations = () => {
  // User has one Employee
  User.hasOne(Employee, {
    foreignKey: 'userId',
    as: 'employee'
  });

  Employee.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Department has many Employees
  Department.hasMany(Employee, {
    foreignKey: 'departmentId',
    as: 'employees'
  });

  Employee.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });

  // Employee has many Attendances
  Employee.hasMany(Attendance, {
    foreignKey: 'employeeId',
    as: 'attendances'
  });

  Attendance.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee'
  });

  // Employee has many Payrolls
  Employee.hasMany(Payroll, {
    foreignKey: 'employeeId',
    as: 'payrolls'
  });

  Payroll.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee'
  });

  // Employee has many Leaves
  Employee.hasMany(Leave, {
    foreignKey: 'employeeId',
    as: 'leaves'
  });

  Leave.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee'
  });

  // User can approve leaves
  User.hasMany(Leave, {
    foreignKey: 'approvedBy',
    as: 'approvedLeaves'
  });

  Leave.belongsTo(User, {
    foreignKey: 'approvedBy',
    as: 'approvedByUser'
  });

  // Payroll associations
  Payroll.belongsTo(User, {
    foreignKey: 'generatedBy',
    as: 'generatedByUser'
  });

  Payroll.belongsTo(User, {
    foreignKey: 'paidBy',
    as: 'paidByUser'
  });

  User.hasMany(Payroll, {
    foreignKey: 'generatedBy',
    as: 'generatedPayrolls'
  });

  User.hasMany(Payroll, {
    foreignKey: 'paidBy',
    as: 'paidPayrolls'
  });
};

// Initialize models and associations
const setupModels = () => {
  initializeModels();
  defineAssociations();
};

// Sync database
const syncDatabase = async () => {
  try {
    // Setup models first
    setupModels();

    const sequelize = dbConfig.getSequelize();
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize: () => dbConfig.getSequelize(),
  User: () => User,
  Department: () => Department,
  Employee: () => Employee,
  Attendance: () => Attendance,
  Payroll: () => Payroll,
  Leave: () => Leave,
  setupModels,
  syncDatabase
};
