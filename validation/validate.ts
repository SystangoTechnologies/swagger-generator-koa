'use strict';
import _ from 'lodash';
import Joi from '@hapi/joi';
import ValidationError from './validation-error';

const defaultOptions = {
  contextRequest: false,
  allowUnknownHeaders: true,
  allowUnknownBody: true,
  allowUnknownQuery: true,
  allowUnknownParams: true,
  allowUnknownCookies: true,
  status: 400,
  statusText: 'Bad Request'
};
let globalOptions = {};

// maps the corresponding request object to an `express-validation` option
const unknownMap: any = {
  headers: 'allowUnknownHeaders',
  body: 'allowUnknownBody',
  query: 'allowUnknownQuery',
  params: 'allowUnknownParams',
  cookies: 'allowUnknownCookies'
};

class Validation {
  public validate(schema: any = {}, opt = {}) {

    return async (ctx: any, next: any) => {

      const errors: any = [];

      const options = _.defaults({}, schema.options || {}, globalOptions, defaultOptions);

      const requestInputType = ['headers', 'body', 'query', 'params', 'cookies'];

      // tslint:disable-next-line:prefer-for-of
      for (let index = 0; index < requestInputType.length; index++) {
        const key = requestInputType[index];
        const allowUnknown = options[unknownMap[key]];
        const entireContext = options.contextRequest ? ctx.request : null;
        if (schema[key]) {
            const toValidateObj = key === 'body' ? ctx.request.body : ctx[key];
            await validate(errors, toValidateObj, schema[key], key, allowUnknown, entireContext);
        }
      }

      if (errors.length !== 0) {
        throw new (ValidationError as any)(errors, options);
      }
      await next();
    };
  }
}

/**
 * validate checks the current `Request` for validations
 * NOTE: mutates `request` in case the object is valid.
 */
async function validate(errObj: any, request: any, schema: any, location: any, allowUnknown: any, context: any) {
  if (!request || !schema) { return; }

  const joiOptions = {
      context: context || request,
      allowUnknown,
      abortEarly: false
  };

  const {
      error,
      value
  } = await Joi.object(schema).validate(request, joiOptions);

  const errors = error;
  if (!errors || errors.details.length === 0) {
      _.assignIn(request, value); // joi responses are parsed into JSON
      return;
  }
  // tslint:disable-next-line:no-shadowed-variable
  errors.details.forEach((error) => {
      const errorExists = _.find(errObj, (item) => {
          if (item && item.field === error.path && item.location === location) {
              item.messages.push(error.message);
              item.types.push(error.type);
              return item;
          }
          return;
      });

      if (!errorExists) {
          errObj.push({
              field: error.path,
              location,
              messages: [error.message],
              types: [error.type]
          });
      }

  });
  return errObj;
}

exports.options = (opts: any) => {
  if (!opts) {
      globalOptions = {};
      return;
  }

  globalOptions = _.defaults({}, globalOptions, opts);
};

const defaultValidation = new Validation();
module.exports = defaultValidation.validate.bind(defaultValidation);

module.exports.ValidationError = ValidationError;
export default Validation;
