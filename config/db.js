import mongoose from "mongoose";

export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected successully to database");
    } catch (error) {
        console.log("error while connecting to database", error);
        throw error;
    }
};
