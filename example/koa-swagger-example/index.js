const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const indexRoutes = require('./src/routes/index');
const userRoutes = require('./src/routes/users');
const swagger = require('swagger-generator-koa');

const app = new Koa();
const PORT = process.env.PORT || 5000;

// body parser
app.use(bodyParser());

// error handler
app.use(async (ctx, next) => {
	try {
	  await next();
	} catch (err) {
	  ctx.status = err.status || err.code;
	  ctx.body = {
		success: false,
		message: err.message,
		errors: err.errors
	  };
	}
});

// routes
app.use(indexRoutes.routes());
app.use(userRoutes.routes());

// server
const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});


const options = {
	title: "swagger-generator-koa",
	version: "1.0.0",
	host: "localhost:5000",
	basePath: "/",
	schemes: ["http", "https"],
	securityDefinitions: {
		Bearer: {
			description: 'Example value:- Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MmQwMGJhNTJjYjJjM',
			type: 'apiKey',
			name: 'Authorization',
			in: 'header'
		}
	},
	security: [{Bearer: []}],
	defaultSecurity: 'Bearer'
};


swagger.serveSwagger(app, "/swagger", options, {routePath : './src/routes', requestModelPath: './src/requestModel', responseModelPath: './src/responseModel'});

module.exports = server;
