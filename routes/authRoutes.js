import express from 'express';
import { loginUser, registerUser, resetPassword, logOutUser, updateUsername } from '../controller/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/logout', logOutUser);
authRouter.put('/update-name', authMiddleware, updateUsername);
export default authRouter;