'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('spams', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reportedByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Ensure this matches your actual users table name
          key: 'id',
        },
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Adding a unique constraint on the combination of reportedByUserId and phoneNumber
    await queryInterface.addConstraint('spams', {
      fields: ['reportedByUserId', 'phoneNumber'],
      type: 'unique',
      name: 'unique_user_phone_number_constraint',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('spams');
  },
};
