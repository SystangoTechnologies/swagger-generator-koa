'use strict';

/**
 * Show home page.
 */
exports.homePage = async (ctx) => {
	ctx.status = 200
	ctx.body = {
		message: 'Koa swagger module'
	}
};
