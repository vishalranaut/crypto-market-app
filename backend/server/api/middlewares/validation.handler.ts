import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ObjectSchema } from 'joi';
import { pick } from '../../common/pick';
import { ApiError } from '../../common/ApiError'; // Update the path as necessary
import httpStatus from 'http-status';

interface ValidationSchema {
  params?: ObjectSchema;
  query?: ObjectSchema;
  body?: ObjectSchema;
}

const validate = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, [
      'params',
      'query',
      'body',
    ] as (keyof ValidationSchema)[]);
    const object = pick(req, Object.keys(validSchema) as (keyof Request)[]); // Ensure correct type casting

    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };
};

export default validate;
