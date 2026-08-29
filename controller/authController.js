import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// register user
export const registerUser = async (req, res) => {
    try {
        const { username, useremail, password,role } = req.body;
        // validation
        if (!username || !useremail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await userModel.findOne({ username });
        const existingEmail = await userModel.findOne({ useremail });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            username,
            useremail,
            password: hashedPassword,
            role
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

// login user
export const loginUser = async (req, res) => {
    try {
        const { useremail, password } = req.body;

        // validation
        if (!useremail || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // find user by email only
        const user = await userModel.findOne({ useremail });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                useremail: user.useremail
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// reset password
export const resetPassword = async (req, res) => {
    try {
        const { useremail, newPassword, confirmPassword } = req.body;

        // validation
        if (!useremail || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // find user by email
        const user = await userModel.findOne({ useremail });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // hash and update new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const logOutUser = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}