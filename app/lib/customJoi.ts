import Joi from 'joi';

// Customize default messages
const customJoi = Joi.defaults((schema) => {
  return schema.messages({
    'string.empty': '{{#label}} is required',
    'any.required': '{{#label}} is required',
    'string.pattern.base': '{{#label}} must be valid',
    'array.min': '{{#label}} must contain at least one item',
    'number.base': '{{#label}} must be a number',
    'number.positive': '{{#label}} must be positive',
    'string.max': '{{#label}} must be less than or equal to {{#limit}} characters',
    'string.uri': '{{#label}} must be a valid URL'
  });
});

export default customJoi;