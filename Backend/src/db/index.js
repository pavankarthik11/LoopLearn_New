import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 3000; // 3 seconds

const connectDB = async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const connectionInstance = await mongoose.connect(
                `${process.env.MONGODB_URI}/${DB_NAME}`,
                {
                    serverSelectionTimeoutMS: 10000, // 10s timeout for initial connection
                    socketTimeoutMS: 45000,
                }
            );
            console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
            
            // Handle disconnection events gracefully
            mongoose.connection.on('disconnected', () => {
                console.warn('MongoDB disconnected. Will attempt to reconnect automatically...');
            });

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err.message);
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected successfully!');
            });

            return; // Success — exit the retry loop
        } catch (error) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
            console.error(
                `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
            );
            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    // All retries exhausted — start background reconnection instead of crashing
    console.error(
        `All ${MAX_RETRIES} MongoDB connection attempts failed. Server will stay alive and keep retrying in the background.`
    );
    startBackgroundReconnection();
};

// Background reconnection loop — keeps trying every 30s
const startBackgroundReconnection = () => {
    const RECONNECT_INTERVAL = 30000; // 30 seconds
    const reconnect = async () => {
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB is already connected.');
            return;
        }
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            console.log('MongoDB reconnected successfully in background!');
        } catch (err) {
            console.error(`Background MongoDB reconnection failed: ${err.message}. Retrying in ${RECONNECT_INTERVAL / 1000}s...`);
            setTimeout(reconnect, RECONNECT_INTERVAL);
        }
    };
    setTimeout(reconnect, RECONNECT_INTERVAL);
};

export default connectDB