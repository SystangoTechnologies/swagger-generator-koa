'use strict';
var User = require('../database/user');

/**
 * Get Users details from database.
 * @param  {Object} ctx koa context
 */
exports.getUsers = async (ctx) => {
	try {
		let results = await User.getAllUsers();
		if (results && results.length) {
			ctx.status = 200;
			ctx.body = results;
			return;
		} else {
			ctx.status = 204;
			return;
		}
	} catch (error) {
		console.log('Error while getting users', error);
		ctx.status = 500;
		ctx.body = {
			message: error.message
		};
		return;
	}
}

/**
 * Create user and save data in database.
 * @param  {Object} ctx koa context
 */
exports.createUser = async (ctx) => {
	try {
		await User.saveUser(ctx.request.body);
		ctx.status = 201;
		return;
	} catch (error) {
		console.log('Error while creating user', error);
		ctx.status = 500;
		ctx.body = {
			message: error.message
		};
		return;
	}
}

/**
 * Update user details
 * @param  {Object} ctx koa context
 */
exports.updateUser = async (ctx) => {
	try {
		let data = ctx.request.body;
		let filter = {
			id: ctx.params.userId
		}
		let result = await User.updateUserDetails(filter, data);
		if (result && result.length && result[0]) {
			ctx.status = 201;
			return;
		} else {
			ctx.status = 204;
			return;
		}
	} catch (error) {
		console.log('Error while updating user', error);
		ctx.status = 500;
		ctx.body = {
			message: error.message
		};
		return;
	}
}

/**
 * Controller get user details based on userid.
 * @param  {Object} ctx koa context
 */
exports.getUserDetails = async (ctx) => {
	try {
		let filter = {
			id: ctx.params.userId
		}
		let details = await User.getUser(filter);
		if (details) {
			ctx.status = 200;
			ctx.body = details;
			return;
		} else {
			ctx.status = 204;
			return;
		}
	} catch (error) {
		console.log('Error while getting user details', error);
		ctx.status = 500;
		ctx.body = {
			message: error.message
		};
		return;
	}
}

/**
 * Delete user information.
 * @param  {Object} ctx koa context
 */
exports.deleteUser = async (ctx) => {
	try {
		let filter = {
			id: ctx.params.userId
		}
		let result = await User.deleteUser(filter);
		if (result) {
			ctx.status = 204;
			return;
		} else {
			ctx.status = 404;
			return;
		}
	} catch (error) {
		console.log('Error while deleting user', error);
		ctx.status = 500;
		ctx.body = {
			message: error.message
		};
		return;
	}
}