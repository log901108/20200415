'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('post', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      title: {
        type: Sequelize.STRING
      },
	  body: {
        type: Sequelize.TEXT
      },
	  tags: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
	  user:{
		  type: Sequelize.JSONB
	  },
	  publishedDate: {
        type: Sequelize.DATE
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
	  }
    }).then(function() {
      return queryInterface.sequelize.query(
        'CREATE INDEX tags_index ON post(tags);'
       );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('post');
  }
};