import mongoose from "mongoose";

export const connectDB = () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("connected successully to database")
    } catch (error) {
        console.log("error while connecting to database", error)
    }

}