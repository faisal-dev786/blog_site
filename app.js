import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/blogs", blogRouter);

export default app;
