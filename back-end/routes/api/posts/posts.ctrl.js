var express = require('express');
var router = express.Router();
const Post = require('../../../models').post;
const { Op } = require('sequelize');
const sanitizeHtml = require('sanitize-html');

const sanitizeOption = {
	allowedTags: [
		'h1',
		'h2',
		'b',
		'strong',
		'em',
		'i',
		'u',
		's',
		'p',
		'ul',
		'ol',
		'li',
		'blockquote',
		'a',
		'img',
		'pre'
	],
	allowedAttributes:{
		a:['href', 'name', 'target'],
		img:['src'],
		li:['class'],
		pre:['class', 'spellcheck'],
	},
	allowedSchemes:['data','http'],
};

const paragraphSet = body =>{
	
}

module.exports.write = async (req,res,next) => {
	const title = req.body.title;
	const body = req.body.body;
	const tags = req.body.tags;
	var userJson = {"_id": req.user.id,"userid":req.user.userid};

	if(title && body && tags){
		Post
		.create({
			title: title,
			body: sanitizeHtml(body,sanitizeOption),
			tags: tags,
			user: userJson,
			publishedDate: new Date()
		}).then((result)=>{
			res.status(200).send(result);
		}).catch((err)=>{
			res.status(400).send({err});
		});	
	}else{
		res.status(400).send({success:false, message:'one or more required contents is empty'});
	}	
};

const removeHtmlAndShorten = body => {
	const filtered = sanitizeHtml(body,{allowedTags:[],
			});
			return filtered.length< 100 ? filtered: `${filtered.slice(0,100)}...`;
}

module.exports.list = async (req,res, next) => {
	
	const page = parseInt(req.query.page || 1, 10);
	
	if(page < 1){
		return res.status(400).send({success:false, msg:'error:page is less then 1'})
	}
	
	const {tag, userid} = req.query;
	
	const query = {
		...(userid ? {'user.userid':{[Op.eq]:userid}} : {}),
		...(tag ? {tags: {[Op.contains]:[tag]}} : {}),
	};
	
	console.log("q:",query);
		
		await Post.findAndCountAll({
			where:query,
			offset: ((page-1)*10), 
			limit: 10,
			order:[['_id','DESC']],
			raw:true, //option to get raw data, not sequelize instances
		})
		.then((result)=>{
			

			const limitBodyLength = (post) => ({
				
				...post,
				//body: post.body.length < 150 ? post.body : `${post.body.slice(0,150)}...` 
				body: removeHtmlAndShorten(post.body)
			});
	
			var array = result.rows.map(limitBodyLength)

			res.setHeader('Last-Page' , Math.ceil(result.count/10) );
			res.cookie('visitors', 'afdafda', { httpOnly: true, maxAge: 10000});
			res.status(200).send(array);
		}).catch((err)=>{
			res.status(500).send({err});
		})	
};

module.exports.read = (req,res, next) => {
	const id = req.params.id;
	console.log(id);
	
	Post
	.findByPk(id).then((result)=>{
		if(!result){
			res.status(404).send({success:false});
		}else{
			res.status(200).send(result);
		}
	}).catch((err)=>{
		res.status(400).send({err})
	})
};

module.exports.remove = (req,res, next) => {
	const id = req.params.id;
	
	Post
	.findByPk(id).then((result)=>{
		if(result){
			Post.destroy({where:{_id: id}});
			res.status(200).send({success:true, "message":`#${id} post is deleted`});
		}else{
			res.status(404).send({success:false})
		}
	})
	
	
};

module.exports.update = async (req,res, next) => {
	const id = req.params.id;
	console.log(req.body);
	const title = req.body.title;
	const body = req.body.body;
	const tags = req.body.tags;

	var updatePhrase={};
	if(req.body.title){
		updatePhrase['title']=title;
	}
	if(req.body.body){
		updatePhrase['body']=sanitizeHtml(body,sanitizeOption);
	}
	if(req.body.tags){
		updatePhrase['tags']=tags;
	}
	
	const updatedResult = await Post.update(updatePhrase,{
			where:{
				_id:id
				},
			returning: true
			}).then((result)=>{
		res.status(200).send(result[1][0]);
	}).catch((err)=>{
		res.status(400).send({success:false, error:err});
	})

};

module.exports.taglist = async (req,res, next) => {
	
	const page = parseInt(req.query.page || 1, 10);
	const tag  = req.params.tags;
	const tagArray =[tag];
	
	console.log(req.params.tags);
	
	if(page < 1){
		res.status(400).send({success:false});
	}
	
		await Post.findAndCountAll({
			where: {tags: {[Op.contains]:[tag]}},
			offset: ((page-1)*10), 
			limit: 10,
			order:[['_id','DESC']],
			raw:true, //option to get raw data, not sequelize instances
		})
		.then((result)=>{
			
			
			const limitBodyLength = (post) => ({
				...post,
				body: post.body.length < 150 ? post.body : `${post.body.slice(0,150)}...` 
			});

			var array = result.rows.map(limitBodyLength)

			res.setHeader('Last-Page' , Math.ceil(result.count/10) );
			res.cookie('visitors', 'afdafda', { httpOnly: true, maxAge: 10000});
			res.status(200).send(array);
		}).catch((err)=>{
			res.status(500).send({err});
		})	
}