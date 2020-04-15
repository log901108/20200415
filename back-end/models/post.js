'use strict';

var revalidator = require('revalidator'); // schema validator 바꾸거나 고칠것 https://github.com/sequelize/sequelize/issues/3698

var schemaValidator = function (schema) {
    return function (value) {
        var results = revalidator.validate(value, schema);
        if (!results.valid) throw new Error(JSON.stringify(results.errors));
    };
};

module.exports = (sequelize, DataTypes) => {
  const post = sequelize.define('post', {
	 _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT
      }, 
    title: DataTypes.STRING,
	body: DataTypes.STRING,
	tags: DataTypes.ARRAY(DataTypes.TEXT),
	user: {
        type: DataTypes.JSONB,
        validate: {
            schema: schemaValidator({
                type: "object",
                properties: {
                    _id: { type: "string", required: false },
					userid: {type:"string",require: true},
                }
            })
        }
    },
	publishedDate: DataTypes.DATE
  }, 
  {
	  timestamp:true,
	  tableName: 'post',
	  paranoid: true,
	  freezeTableName: true,
      underscored: false,
  });
  post.associate = function(models) {
    // associations can be defined here
  };
  return post;
};