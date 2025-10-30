const { Model, DataTypes } = require('sequelize');
const { dbConfig } = require('../config/database');

const Leave = (sequelize) => sequelize.define('Leave', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'employee_id', // maps to DB column
    references: { model: 'employees', key: 'id' }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date',  // map to DB
    validate: { isDate: true }
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date',    // map to DB
    validate: { isDate: true }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  leaveType: {
    type: DataTypes.ENUM('sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'other'),
    allowNull: false,
    defaultValue: 'personal',
    field: 'leave_type'
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_days'
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approved_by',
    references: { model: 'users', key: 'id' }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'leaves',
  timestamps: false,
  indexes: [
    { fields: ['employee_id', 'start_date', 'end_date'] }, // use DB column names
    { fields: ['status'] },
    { fields: ['start_date', 'end_date'] }
  ]
});

module.exports = Leave;
