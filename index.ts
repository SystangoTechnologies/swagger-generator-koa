import { swaggerize, common, initialise, compile, json, ensureValid } from 'swagger-spec-express';
import j2s from 'joi-to-swagger';
import responsesEnum from './responsesEnum';
import { isEmpty, map, get, has } from 'lodash';
import fs from 'fs';
import { resolve, join } from 'path';
import convert from 'koa-convert';
import mount from 'koa-mount';
import swaggerUi from 'swagger-ui-koa';

/**
 * This module will support all the functionality of swagger-spec-express with additonal
 * functions of this module.
 * This module uses swagger-spec-express, swagger-ui-express and joi-to-swagger modules to
 * generate swagger documentation with joi validation.
 */

export = {
  swaggerize,
  createModel,
  serveSwagger,
  describeSwaggerWithoutPath
};

/**
 * This will create models for all the provides responses(with joi vlaidations).
 * @param {object} responseModel
 */

function createResponseModel({ responseModel, name }: { responseModel: any; name: string }) {
  const bodyParameter = j2s(responseModel).swagger;
  const model = Object.assign(
    {
      name,
    },
    bodyParameter,
  );
  common.addModel(model);
}

/**
 * Serve swagger.
 * @param {*} app express object.
 * @param {*} endPoint swagger end point.
 * @param {*} options  swagger options.
 */
function serveSwagger(
  app: any,
  endPoint: string,
  options: object,
  path: { routePath: string; requestModelPath: string; responseModelPath: string },
) {
  if (path.routePath) {
    describeSwagger(app, path.routePath, path.requestModelPath, path.responseModelPath);
  } else {
    describeSwaggerWithoutPath(app, path.requestModelPath, path.responseModelPath);
  }
  initialise(app, options);
  compile(); // compile swagger document
  app.use(swaggerUi.serve); // serve swagger static files
  app.use(convert(mount(endPoint, swaggerUi.setup(json(), false, null, null, null))));
}

/**
 * This function will generate json for the success response.
 * @param {object} schema
 * @param {object} describe
 */

function createResponses(schema: any, responseModel: any, describe: any) {
  const responses: any = {
    500: {
      description: responsesEnum[500],
    },
  };
  if (responseModel && !isEmpty(responseModel)) {
    for (const key in responseModel) {
      if (responseModel.hasOwnProperty(key)) {
        createResponseModel({
          responseModel: responseModel[key],
          name: `${schema.model}${key}ResponseModel`,
        });
        responses[key] = {
          description: responsesEnum[key] ? responsesEnum[key] : '',
          schema: {
            $ref: `#/definitions/${schema.model}${key}ResponseModel`,
          },
        };
      }
    }
  }
  describe.responses = responses;
  return describe;
}

/**
 * This function will generate json given header parameter in schema(with joi validation).
 * @param {object} schema
 * @param {object} describe
 */

function getHeader(schema: any, describe: any) {
  const arr = [];
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      arr.push(key);
      const query = schema[key];
      const queryObject = {
        name: key,
        type: query._type ? query._type : query,
        required: query.required === 'undefined' ? false : true,
      };
      if (query._flags && query._flags.presence) {
        queryObject.required = query._flags.presence === 'required' ? true : false;
      }
      common.parameters.addHeader(queryObject);
    }
  }

  if (describe.common.parameters) {
    describe.common.parameters.header = arr;
  } else {
    describe.common.parameters = {};
    describe.common.parameters.header = arr;
  }

  return describe;
}

/**
 * This function will create models for given path and query schema and
 * convert it to json(with joi validation).
 * @param {object} schema
 * @param {string} value either query and path
 * @param {object} describe
 */

function getQueryAndPathParamObj(schema: any, value: string, describe: any) {
  const arr = [];
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      arr.push(key);
      const query = schema[key];

      const queryObject = {
        name: key,
        type: query._type ? query._type : query,
        required: query.required === 'undefined' ? false : true,
      };
      if (query._flags && query._flags.presence) {
        queryObject.required = query._flags.presence === 'required' ? true : false;
      }
      value === 'query' ? common.parameters.addQuery(queryObject) : common.parameters.addPath(queryObject);
    }
  }
  if (describe.common.parameters) {
    value === 'query' ? (describe.common.parameters.query = arr) : (describe.common.parameters.path = arr);
  } else {
    describe.common.parameters = {};
    value === 'query' ? (describe.common.parameters.query = arr) : (describe.common.parameters.path = arr);
  }

  return describe;
}

/**
 * This function will create models for given body schema
 * and convert it to json(with joi validation).
 * @param {object} schema
 * @param {object} describe
 */
function getBodyParameters(
  schema: { body: any; model: any; description: any },
  describe: { tags?: any[]; common: any },
) {
  const bodyParameter = j2s(schema.body).swagger;
  const model = Object.assign(
    {
      name: `${schema.model}Model`,
    },
    bodyParameter,
  );
  common.addModel(model);
  common.parameters.addBody({
    name: `${schema.model}Model`,
    required: true,
    description: schema.description || undefined,
    schema: {
      $ref: `#/definitions/${schema.model}Model`,
    },
  });
  describe.common = {
    parameters: {
      body: [`${schema.model}Model`],
    },
  };
  return describe;
}

/**
 * This function will create proper schema based on given body, query, header and path parameter
 * mentioned in the schema.
 * @param {object} schema this is schema mentioned for each API in a route.
 */
function createModel(schema: any, responseModel: { [x: string]: any; hasOwnProperty: (arg0: string) => void }) {
  let describe: any = {
    tags: [schema.group],
    common: {},
  };
  describe = {
    ...createResponses(schema, responseModel, describe),
  };
  if (schema && schema.body) {
    const bodyParams = getBodyParameters(schema, describe);
    describe = {
      ...bodyParams,
    };
  }
  if (schema && schema.query) {
    const queryParams = getQueryAndPathParamObj(schema.query, 'query', describe);
    describe = {
      ...queryParams,
    };
  }

  if (schema && schema.path) {
    const pathParams = getQueryAndPathParamObj(schema.path, 'path', describe);
    describe = {
      ...pathParams,
    };
  }

  if (schema && schema.header) {
    const headerParams = getHeader(schema.header, describe);
    describe = {
      ...headerParams,
    };
  }
  return describe;
}
/**
 * @param app : Koa object
 * @param routePath : routh folder path.
 * @param requestModelPath : request model path
 * @param responseModelPath : responsemodel model path.
 */
function describeSwagger(app: any, routePath: string, requestModelPath: string, responseModelPath: any) {
  try {
    app._router = {
      stack: []
    };
    const rootPath = resolve(__dirname).split('/node_modules')[0];
    fs.readdirSync(join(rootPath, routePath)).forEach((file: any) => {
      if (!file) {
        console.log('No router file found in given folder');
        return;
      }
      let responseModel;
      let requestModel;
      const route = join(rootPath, routePath, file);
      const router = require(route);
      if (!router || !router.stack) {
        console.log('Router missing');
        return;
      }
      const responseModelFullPath = join(rootPath, responseModelPath, file);
      const requestModelFullPath = join(rootPath, requestModelPath, file);
      if (fs.existsSync(requestModelFullPath)) {
        requestModel = require(requestModelFullPath);
      }
      if (fs.existsSync(responseModelFullPath)) {
        responseModel = require(responseModelFullPath);
      }
      processRouter(app, router, requestModel, responseModel, file.split('.')[0]);
    });
  } catch (error) {
    console.log(`Error in describeSwagger ${error}`);
    return;
  }
}

function processRouter(app: any, item: any, requestModel: any, responseModel: any, routerName: any) {
  try {
    if (item.stack && item.stack.length > 0) {
      let count = 0;
      // tslint:disable-next-line:no-unused-expression
      map(item.stack, (route: any) => {
        let routeRequestModel = get(requestModel, [count]);
        const routeResposeModel = get(responseModel, get(routeRequestModel, ['model']));
        if (routeRequestModel && routeRequestModel.excludeFromSwagger) {
          count++;
          return;
        }
        if (!routeRequestModel || !has(routeRequestModel, 'group')) {
          routeRequestModel = {
            group: routerName,
            description: routerName,
          };
        }
        const data = Object.assign({}, createModel(routeRequestModel, routeResposeModel));
        describeRouterRoute(route, data);
        app._router['stack'].push(route);
        count++;
        return item;
      })[0];
    }
  } catch (error) {
    console.log(`Error in processRouter ${error}`);
    return;
  }
}

function describeRouterRoute(router: any, metaData: any) {
  if (metaData.described) {
    console.warn('Route already described');
    return;
  }
  if (!metaData) {
    throw new Error('Metadata must be set when calling describe');
  }
  if (!router) {
    throw new Error(
      // tslint:disable-next-line:max-line-length
      'router was null, either the item that swaggerize & describe was called on is not an express app/router or you have called describe before adding at least one route',
    );
  }

  if (!router) {
    throw new Error(
      // tslint:disable-next-line:max-line-length
      'Unable to add swagger metadata to last route since the last item in the stack was not a route. Route name :' +
        router.name +
        '. Metadata :' +
        JSON.stringify(metaData),
    );
  }
  const verb = router.methods[0] === 'HEAD' ? router.methods[1] : router.methods[0];
  if (!verb) {
    throw new Error(
      // tslint:disable-next-line:max-line-length
      "Unable to add swagger metadata to last route since the last route's methods property was empty" +
        router.name +
        '. Metadata :' +
        JSON.stringify(metaData),
    );
  }
  ensureValid(metaData);
  ensureAtLeastOneResponse(metaData);
  metaData.path = router.path;
  metaData.verb = verb.toLowerCase();
  router.swaggerData = metaData;
  router.route = {
      swaggerData: metaData,
      path: metaData.path
  };
  metaData.described = true;
}

/**
 * @param app : Koa object
 * @param requestModelPath : request model path
 * @param responseModelPath : responsemodel model path.
 */
function describeSwaggerWithoutPath(app: any, requestModelPath: string, responseModelPath: string) {
  try {
      app._router = {
          stack: []
      };
      const rootPath = resolve(__dirname).split('/node_modules')[0];
      app.middleware.forEach((middleware: any) => {
          let responseModel;
          let requestModel;
          if (middleware.name !== 'dispatch') {
              return;
          }
          if (!middleware.router || !middleware.router.stack) {
              console.log('Router missing');
              return;
          }
          const routerPrefix = get(middleware, ['router', 'opts', 'prefix']);
          let routerBasePath;
          if (routerPrefix) {
              routerBasePath = routerPrefix.replace(/\//g, '');
          }
          if (!routerBasePath) {
              routerBasePath = 'Home';
          }
          const responseModelFullPath = join(rootPath, responseModelPath, `${routerPrefix}.js`);
          const requestModelFullPath = join(rootPath, requestModelPath, `${routerPrefix}.js`);
          if (fs.existsSync(requestModelFullPath)) {
              requestModel = require(requestModelFullPath);
          }
          if (fs.existsSync(responseModelFullPath)) {
              responseModel = require(responseModelFullPath);
          }
          processRouter(app, middleware.router, requestModel, responseModel, routerBasePath);
      });
  } catch (error) {
      console.log(`Error in describeSwagger ${error}`);
      return;
  }
}

function ensureAtLeastOneResponse(metaData: any) {
  if (metaData.responses && Object.keys(metaData.responses).length > 0) {
    return;
  }
  if (metaData.common && metaData.common.responses.length > 0) {
    return;
  }
  throw new Error(
    // tslint:disable-next-line:max-line-length
    'Each metadata description for a route must have at least one response, either specified in metaData.responses or metaData.common.responses.',
  );
}
