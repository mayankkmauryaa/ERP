const { DataTypes } = require('sequelize');
const { dbConfig } = require('../config/database');

const Attendance = (sequelize) => sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  checkIn: {
    type: DataTypes.TIME,
    allowNull: true
  },
  checkOut: {
    type: DataTypes.TIME,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half_day'),
    allowNull: false,
    defaultValue: 'absent',
    validate: {
      isIn: [['present', 'absent', 'late', 'half_day']]
    }
  },
  workingHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 24
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lateMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 12
    }
  }
}, {
  tableName: 'attendances',
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'date']
    }
  ]
});

module.exports = Attendance;
