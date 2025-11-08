import { Hono } from 'hono';
import { validateBody } from '../utils/zodHandler.js';
import { RegisterSchema, LoginSchema } from '../schemas/auth.js';
import { register, login } from '../controllers/auth.controller.js';

export const auth = new Hono();

auth.post('/register', validateBody(RegisterSchema), register);
auth.post('/login', validateBody(LoginSchema), login);
