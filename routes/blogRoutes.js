import express from 'express';
import { createBlogPost, getAllBlogPosts, getBlogPostById, updateBlogPost, deleteBlogPost } from '../controller/blogPostsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const blogRouter = express.Router();

blogRouter.post('/createBlog', authMiddleware, createBlogPost);
blogRouter.get('/getBlogs',authMiddleware, getAllBlogPosts);
blogRouter.get('/getBlog/:id',authMiddleware, getBlogPostById);
blogRouter.put('/updateBlog/:id',authMiddleware, updateBlogPost);
blogRouter.delete('/deleteBlog/:id', authMiddleware, deleteBlogPost);

export default blogRouter;