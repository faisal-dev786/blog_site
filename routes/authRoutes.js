import express from 'express';
import { loginUser, registerUser, resetPassword, logOutUser } from '../controller/authController.js';
const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/logout', logOutUser);
export default authRouter;