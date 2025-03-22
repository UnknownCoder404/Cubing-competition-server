import mongoose from "mongoose";
import { config } from "dotenv";

config();

console.log(`Running ${import.meta.url}`);

// List of required environment variables
const requiredEnvVars = ["MONGO_URI", "SESSION_SECRET"] as const;

// List of optional environment variables
const optionalEnvVars = ["PORT"] as const;

const checkEnvVars = (): boolean => {
    let allVarsDefined: boolean = true;
    requiredEnvVars.forEach((varName: string) => {
        if (!(process.env as NodeJS.ProcessEnv)[varName]) {
            console.warn(
                `Warning: Environment variable ${varName} is not defined.`,
            );
            allVarsDefined = false;
        }
    });
    optionalEnvVars.forEach((varName: string) => {
        if (!(process.env as NodeJS.ProcessEnv)[varName]) {
            console.log(
                `Environment variable ${varName} is undefined, but is optional so continuing.`,
            );
        }
    });
    return allVarsDefined;
};

const checkDbConnection = async (): Promise<void> => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("Database connection successful.");
    } catch (error: any) {
        // Using 'any' for error type for simplicity, could be more specific
        console.error("Database connection failed:", error.message);
        process.exit(1); // Exit the process with failure
    }
};

const precheck = async (): Promise<void> => {
    console.time("Precheck");
    if (!checkEnvVars()) {
        console.warn(
            "Some environment variables are missing. Please check your .env file.",
        );
        process.exit(1); // Exit the process with failure
    }
    await checkDbConnection();
    console.log("Precheck successful.");
    console.timeEnd("Precheck");
    process.exit(0); // Exit the process with success
};

precheck();
