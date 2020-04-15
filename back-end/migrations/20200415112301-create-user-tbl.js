'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_tbl', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      userid: {
		allowNull: false,
        type: Sequelize.STRING(50)
      },
	  username: {
		  allowNull: false,
		  type: Sequelize.STRING(50)
	  },
      password_hash: {
		allowNull: false,  
        type: Sequelize.STRING(255)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
	  deletedAt: {
        type: Sequelize.DATE
      },
	  login_fail_count: {
		  type: Sequelize.INTEGER, 
		  defaultValue: 0
	  },
	  is_account_lock: {
		  type: Sequelize.BOOLEAN,
		  defaultValue: false,
	  },
	  latest_login_date: Sequelize.DATE,
	  try_login_date: Sequelize.DATE,
	  is_admin: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
	  },
	  login_ip: Sequelize.STRING(15),
	  refresh_token: Sequelize.STRING(255),
    }).then(function() {
      return queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX user_tbl_unique_index ON user_tbl (userid);'
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_tbl');
  }
};