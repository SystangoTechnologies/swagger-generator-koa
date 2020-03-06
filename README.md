# swagger-generator-koa

NPM module to generate swagger documentation for KOA APIs with minimum additional effort.

>[![Downloads](https://badgen.net/npm/dt/swagger-generator-koa)](https://www.npmjs.com/package/swagger-generator-koa) [![npm dependents](https://badgen.net/npm/dependents/swagger-generator-koa)](https://www.npmjs.com/package/swagger-generator-koa?activeTab=dependents)

## Description
This NPM module let's you validate and generate swagger (OpenAPI) documentation for your KOA APIs without putting in much extra efforts. You just need to follow the convention for your request and response objects, and the module will take care of the rest. This module will cover your controllers, API specs along with request and response object structures.


## Usage ##

Install using npm:

```bash
$ npm install --save swagger-generator-koa
```

### Koa setup `index.js` ###

```javascript
const Koa = require('koa');
const app = new Koa();
const swagger = require("swagger-generator-koa");

// Define your router here

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


/**
 * serveSwagger must be called after defining your router.
 * @param app Koa object
 * @param endPoint Swagger path on which swagger UI display
 * @param options Swagget Options.
 * @param path.routePath path to folder in which routes files defined.
 * @param path.requestModelPath Optional parameter which is path to folder in which requestModel defined, if not given request params will not display on swagger documentation.
 * @param path.responseModelPath Optional parameter which is path to folder in which responseModel defined, if not given response objects will not display on swagger documentation.
 */
swagger.serveSwagger(app, "/swagger", options, {routePath : './src/routes/', requestModelPath: './src/requestModel', responseModelPath: './src/responseModel'});

```

### Koa router `user.js` ###

```javascript

const Router = require('koa-router');
const router = new Router();
const userController = require('../controller/user');
const {validation} = require('swagger-generator-koa');
var requestModel = require('../requestModel/users');
const BASE_URL = `/users`;

router.post(`${BASE_URL}/`, validation(requestModel[0]), userController.createUser);

router.get(`${BASE_URL}/`, userController.getUsers);

router.put(`${BASE_URL}/:userId`, userController.updateUser);

router.get(`${BASE_URL}/:userId`, userController.getUserDetails);

router.delete(`${BASE_URL}/:userId`, userController.deleteUser);

module.exports = router;

```

## Request Model `/requestModel/user.js`
  - File name for request model should be same as router file.
  - Define request model with their order of apis in router js file. For example first api in user router is create user so you need to define createUser schema with key 0.
  - Add boolean flag "excludeFromSwagger" inside requestmodel if you want to exclude any particular api from swagger documentation.
  - This Request model follows Joi module conventions, so it can also be used for request parameters validation.

```javascript
const Joi = require("@hapi/joi");
/**
 * File name for request and response model should be same as router file.
 * Define request model with their order in router js file.
 * For example first api in user router is create user so we define createUser schema with key 0.
 */
module.exports = {
    // Here 0 is the order of api in route file.
    0: {
        body: {
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            address: Joi.string().required(),
            contact: Joi.number().required()
        },
        model: "createUser", // Name of the model
        group: "User", // Swagger tag for apis.
        description: "Create user and save details in database"
    },
    1: {
        query: {},
        path: {}, // Define for api path param here.
        header: {}, // Define if header required.
        group: "User",
        description: "Get All User"
    },
    2: {
        body: {
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            address: Joi.string().required(),
            contact: Joi.number().required()
        },
        model: "updateUser",
        group: "User",
        description: "Update User"
    },
    3: {
        query: {},
        path: {
            userId: Joi.number().required()
        }, // Define for api path param here.
        header: {}, // Define if header required.
        model: 'getUserDetails',
        group: "User",
        description: "Get user details"
    },
    4: {
        excludeFromSwagger: false // Make it true if need to exclude apis from swagger.
    }
};
```

## Response Model `/responseModel/user.js`

 - File name for response model should be same as router file.
 - Response name should be same as model name from requestmodel. For example model name of create user api is "createUser" so key for response object will be "createUser".
 - Inside response model define responses with respect to their status code returned from apis.

```javascript

// The name of each response payload should be model name defined in Request model schema.

module.exports = {
    createUser: { // This name should be model name defined in request model.
        201: {
            message: {
                type: 'string'
            }
        },
        500: {
            internal: {
                type: 'string'
            }
        }
    },
    getUsers: {
        200: [{
            id: {
                type: 'number'
            },
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            address: {
                type: 'string'
            },
            contact: {
                type: 'number'
            },
            createdAt: {
                type: 'number',
                format: 'date-time'
            },
            updatedAt: {
                type: 'number',
                format: 'date-time'
            }
        }],
        500: {
            internal: {
                type: 'string'
            }
        }
    },
    updateUser: {
        201: {
            message: {
                type: 'string'
            }
        },
        500: {
            internal: {
                type: 'string'
            }
        }
    },
    getUserDetails: {
        200: {
            id: {
                type: 'number'
            },
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            address: {
                type: 'string'
            },
            contact: {
                type: 'number'
            },
            createdAt: {
                type: 'number',
                format: 'date-time'
            },
            updatedAt: {
                type: 'number',
                format: 'date-time'
            }
        },
        500: {
            internal: {
                type: 'string'
            }
        }
    },
};
```

Open `http://`<app_host>`:`<app_port>`/swagger` in your browser to view the documentation.

# Version changes

## v2.0.0

#### Added Request Parameter Validation Function

- Use `validation` function exported from this module to validate request params.

```javascript
'use strict';
const Router = require('koa-router');
const router = new Router();
const userController = require('../controller/user');
const {validation} = require('swagger-generator-koa');
var requestModel = require('../requestModel/users');
const BASE_URL = `/users`;

router.post(`${BASE_URL}/`, validation(requestModel[0]), userController.createUser);

module.exports = router;

```

## Requirements

- Node v10 or above
- KOA 2 or above

## Contributors

[Vikas Patidar](https://www.linkedin.com/in/vikas-patidar-0106/)
