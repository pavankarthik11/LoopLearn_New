import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

// Start the server immediately — don't wait for MongoDB
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running at port : ${PORT}`);
});

app.on("error", (error) => {
    console.log("Server error: ", error);
});

// Connect to MongoDB in the background (with retry logic)
connectDB()
    .then(() => {
        console.log("MongoDB connection process completed.");
    })
    .catch((err) => {
        // This won't crash the server — connectDB handles retries internally
        console.error("MongoDB initial connection process failed:", err.message);
    });