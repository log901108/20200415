const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../../config/config.json')[env];


module.exports.create = async (req,res,next) => {

const db = {};

let sequelize;
const tablename = req.body.table;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
	res.status(200).send({success:success, message:'one or more required contents is empty'});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
	//console.log(sequelize)
	await sequelize.query(`CREATE TABLE ${tablename}_tbl(id serial PRIMARY KEY,username VARCHAR (50) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE);`)
	
var ext = sequelize.import(`${tablename}_tbl`, (sequelize, DataTypes) => {
  return sequelize.define(`${tablename}_tbl`, {
	id: {
		 allowNull: false,
		 autoIncrement: true,
         primaryKey: true,
		 type: DataTypes.INTEGER
	  },
  	username: {
		 allowNull: false,
		  type: DataTypes.STRING(50)
	  },
	createdAt:{
		type: DataTypes.DATE
	  },
	updatedAt:{
		allowNull: true,
		type: DataTypes.DATE
	 },
	dletedAt:{
		allowNull: true,
		type: DataTypes.DATE
	 }
	},{
	  timestamp: false,
	  tableName: `${tablename}_tbl`,
	  paranoid: false,
	  freezeTableName: true,
      underscored: false,
  });
});
	
	db.sequelize = sequelize;
	await ext
		.create({
			username: 'userJson',
		}).then((result)=>{
			res.status(200).send(result);
		}).catch((err)=>{
			res.status(400).send({err});
		});	
	
	
	
	//res.status(400).send({success:false, message:'one or more required contents is empty'});
}

	
};


module.exports.write = async (req,res,next) => {
	const tablename = req.body.table;
	const db = {};
	let sequelize;
	if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
	res.status(200).send({success:success, message:'one or more required contents is empty'});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
	
	var ext = sequelize.import(`${tablename}_tbl`, (sequelize, DataTypes) => {
  return sequelize.define(`${tablename}_tbl`, {
	id: {
		 allowNull: false,
		 autoIncrement: true,
         primaryKey: true,
		 type: DataTypes.INTEGER
	  },
  	username: {
		 allowNull: false,
		  type: DataTypes.STRING(50)
	  },
	createdAt:{
		type: DataTypes.DATE
	  },
	updatedAt:{
		allowNull: true,
		type: DataTypes.DATE
	 },
	dletedAt:{
		allowNull: true,
		type: DataTypes.DATE
	 }
	},{
	  timestamp: false,
	  tableName: `${tablename}_tbl`,
	  paranoid: false,
	  freezeTableName: true,
      underscored: false,
  });
});
	
	db.sequelize = sequelize;
	await ext
		.create({
			username: `${req.body.name}`,
		}).then((result)=>{
			res.status(200).send(result);
		}).catch((err)=>{
			res.status(400).send({err});
		});	
}
	
};