// create a new blog post
import BlogPost from '../models/blogPost.js';
import authMiddleware from '../middlewares/authMiddleware.js';
export const createBlogPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const newBlogPost = new BlogPost({
            title,
            content,
            author: req.user._id
        });
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        await newBlogPost.save();
        res.status(201).json(newBlogPost);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const getAllBlogPosts = async (req, res) => {
    try {
        const blogPosts = await BlogPost.find().populate('author', 'username');
        res.status(200).json(blogPosts);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const getBlogPostById = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id).populate('author', 'username');
        if (!blogPost) {
            return res.status(404).json({ message: "Blog post not found" });
        }
        res.status(200).json(blogPost);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const updateBlogPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedBlogPost = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { returnDocument: 'after' }
        );
        if (!updatedBlogPost) {
            return res.status(404).json({ message: "Blog post not found" });
        }
        if (updatedBlogPost.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this blog post" });
        }
        res.status(200).json(updatedBlogPost);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const deleteBlogPost = async (req, res) => {
    try {
        const deletedBlogPost = await BlogPost.findByIdAndDelete(req.params.id);
        if (!deletedBlogPost) {
            return res.status(404).json({ message: "Blog post not found" });
        }
        // check if the user is the author of the blog post or an admin
        const isAuthor = deletedBlogPost.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this blog post" });
        }
        res.status(200).json({ message: "Blog post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}