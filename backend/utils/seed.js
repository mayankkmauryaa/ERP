const { User, Department, Employee } = require('../models');
const { testConnection, syncDatabase } = require('../config/database');
require('dotenv').config();

/**
 * Seed script to create initial data for the ERP system
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Test database connection
    await testConnection();

    // Sync database models
    await syncDatabase();

    // Create default departments
    console.log('📁 Creating default departments...');
    const departments = await Promise.all([
      Department.findOrCreate({
        where: { name: 'Human Resources' },
        defaults: {
          name: 'Human Resources',
          description: 'Manages employee relations, recruitment, and HR policies'
        }
      }),
      Department.findOrCreate({
        where: { name: 'Information Technology' },
        defaults: {
          name: 'Information Technology',
          description: 'Handles software development, system administration, and technical support'
        }
      }),
      Department.findOrCreate({
        where: { name: 'Finance' },
        defaults: {
          name: 'Finance',
          description: 'Manages financial operations, accounting, and budgeting'
        }
      }),
      Department.findOrCreate({
        where: { name: 'Marketing' },
        defaults: {
          name: 'Marketing',
          description: 'Handles marketing campaigns, brand management, and customer acquisition'
        }
      }),
      Department.findOrCreate({
        where: { name: 'Operations' },
        defaults: {
          name: 'Operations',
          description: 'Manages day-to-day business operations and process optimization'
        }
      })
    ]);

    console.log(`✅ Created ${departments.length} departments`);

    // Create admin user
    console.log('👤 Creating admin user...');
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@erp.com' },
      defaults: {
        name: 'System Administrator',
        email: 'admin@erp.com',
        password: 'admin123',
        role: 'admin'
      }
    });

    if (adminCreated) {
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@erp.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create HR user
    console.log('👤 Creating HR user...');
    const [hrUser, hrCreated] = await User.findOrCreate({
      where: { email: 'hr@erp.com' },
      defaults: {
        name: 'HR Manager',
        email: 'hr@erp.com',
        password: 'hr123',
        role: 'hr'
      }
    });

    if (hrCreated) {
      console.log('✅ HR user created successfully');
      console.log('📧 Email: hr@erp.com');
      console.log('🔑 Password: hr123');
    } else {
      console.log('ℹ️  HR user already exists');
    }

    // Create sample employee user
    console.log('👤 Creating sample employee user...');
    const [employeeUser, employeeCreated] = await User.findOrCreate({
      where: { email: 'employee@erp.com' },
      defaults: {
        name: 'John Doe',
        email: 'employee@erp.com',
        password: 'employee123',
        role: 'employee'
      }
    });

    if (employeeCreated) {
      console.log('✅ Sample employee user created successfully');
      console.log('📧 Email: employee@erp.com');
      console.log('🔑 Password: employee123');
    } else {
      console.log('ℹ️  Sample employee user already exists');
    }

    // Create sample employee record
    if (employeeCreated) {
      console.log('👨‍💼 Creating sample employee record...');
      const hrDepartment = departments.find(d => d[0].name === 'Human Resources')[0];

      await Employee.findOrCreate({
        where: { userId: employeeUser.id },
        defaults: {
          name: 'John Doe',
          email: 'employee@erp.com',
          phone: '+1234567890',
          address: '123 Main Street, City, State 12345',
          designation: 'Software Developer',
          salary: 75000.00,
          joiningDate: '2023-01-15',
          departmentId: hrDepartment.id,
          userId: employeeUser.id
        }
      });
      console.log('✅ Sample employee record created');
    }

    // Create additional sample employees
    console.log('👥 Creating additional sample employees...');
    const sampleEmployees = [
      {
        name: 'Jane Smith',
        email: 'jane.smith@erp.com',
        password: 'jane123',
        role: 'employee',
        employee: {
          phone: '+1234567891',
          address: '456 Oak Avenue, City, State 12345',
          designation: 'Marketing Specialist',
          salary: 65000.00,
          joiningDate: '2023-03-01',
          departmentId: departments.find(d => d[0].name === 'Marketing')[0].id
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@erp.com',
        password: 'mike123',
        role: 'employee',
        employee: {
          phone: '+1234567892',
          address: '789 Pine Street, City, State 12345',
          designation: 'Financial Analyst',
          salary: 70000.00,
          joiningDate: '2023-02-15',
          departmentId: departments.find(d => d[0].name === 'Finance')[0].id
        }
      }
    ];

    for (const empData of sampleEmployees) {
      const [user, userCreated] = await User.findOrCreate({
        where: { email: empData.email },
        defaults: {
          name: empData.name,
          email: empData.email,
          password: empData.password,
          role: empData.role
        }
      });

      if (userCreated) {
        await Employee.create({
          name: empData.name,
          email: empData.email,
          ...empData.employee,
          userId: user.id
        });
        console.log(`✅ Created employee: ${empData.name}`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Users Created:');
    console.log('┌─────────────────┬─────────────────┬─────────────┬─────────────┐');
    console.log('│ Name            │ Email           │ Role        │ Password    │');
    console.log('├─────────────────┼─────────────────┼─────────────┼─────────────┤');
    console.log('│ System Admin    │ admin@erp.com   │ admin       │ admin123    │');
    console.log('│ HR Manager      │ hr@erp.com      │ hr          │ hr123       │');
    console.log('│ John Doe        │ employee@erp.com│ employee    │ employee123 │');
    console.log('│ Jane Smith       │ jane.smith@erp.com│ employee  │ jane123     │');
    console.log('│ Mike Johnson    │ mike.johnson@erp.com│ employee │ mike123     │');
    console.log('└─────────────────┴─────────────────┴─────────────┴─────────────┘');

    console.log('\n📁 Departments Created:');
    departments.forEach(([dept]) => {
      console.log(`• ${dept.name}`);
    });

    console.log('\n🚀 You can now start the server with: npm start');
    console.log('📚 API Documentation: http://localhost:3000/api/docs');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed script if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
