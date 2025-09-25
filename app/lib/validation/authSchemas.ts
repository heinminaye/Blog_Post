import customJoi from '../customJoi';

export const LoginSchema = customJoi.object({
  email: customJoi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label('Email'),
  password: customJoi.string()
    .required()
    .label('Password')
}).options({ abortEarly: false });