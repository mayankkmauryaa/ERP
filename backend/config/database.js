const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Database Configuration Class
 * Handles database connection, configuration validation, and connection management
 */
class DatabaseConfig {
  constructor() {
    this.sequelize = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Validate required environment variables
   */
  validateConfig() {
    const requiredVars = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
      console.warn('Using default values. Please set these variables in your .env file for production.');
    }
  }

  /**
   * Get database configuration based on environment
   */
  getConfig() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      database: process.env.DB_NAME || 'erp_database',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: isDevelopment ? console.log : false,
      pool: {
        max: isProduction ? 20 : 5,
        min: isProduction ? 5 : 0,
        acquire: 30000,
        idle: 10000,
        evict: 1000
      },
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true, // Enable soft deletes
        freezeTableName: true
      },
      dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        supportBigNumbers: true,
        bigNumberStrings: true
      },
      timezone: '+00:00' // UTC
    };
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      this.validateConfig();

      const config = this.getConfig();
      this.sequelize = new Sequelize(config);

      await this.testConnection();
      this.isConnected = true;

      console.log('✅ Database configuration initialized successfully');
      return this.sequelize;
    } catch (error) {
      console.error('❌ Failed to initialize database:', error.message);
      throw error;
    }
  }

  /**
   * Test database connection with retry logic
   */
  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Database connection has been established successfully.');
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (error) {
      this.retryCount++;
      console.error(`❌ Unable to connect to the database (attempt ${this.retryCount}/${this.maxRetries}):`, error.message);

      if (this.retryCount < this.maxRetries) {
        console.log(`⏳ Retrying connection in ${this.retryDelay / 1000} seconds...`);
        await this.delay(this.retryDelay);
        return this.testConnection();
      } else {
        console.error('❌ Maximum retry attempts reached. Exiting...');
        process.exit(1);
      }
    }
  }

  /**
   * Get database connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries
    };
  }

  /**
   * Close database connection gracefully
   */
  async closeConnection() {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        this.isConnected = false;
        console.log('✅ Database connection closed successfully.');
      }
    } catch (error) {
      console.error('❌ Error closing database connection:', error.message);
      throw error;
    }
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get sequelize instance
   */
  getSequelize() {
    if (!this.sequelize) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.sequelize;
  }
}

// Create singleton instance
const dbConfig = new DatabaseConfig();

// Initialize database connection
const initializeDatabase = async () => {
  try {
    return await dbConfig.initialize();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Test connection function for backward compatibility
const testConnection = async () => {
  try {
    await dbConfig.testConnection();
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    throw error;
  }
};

// Export both the instance and individual functions for flexibility
module.exports = {
  sequelize: null, // Will be set after initialization
  dbConfig,
  initializeDatabase,
  testConnection,
  getConnectionStatus: () => dbConfig.getConnectionStatus(),
  closeConnection: () => dbConfig.closeConnection()
};
