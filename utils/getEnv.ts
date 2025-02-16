export default function getEnv() {
    const env = process.env;

    if (!env.MONGO_URI || !env.JWT_SECRET) {
        throw new Error(
            "Missing required environment variables: MONGO_URI, JWT_SECRET",
        );
    }

    return {
        MONGO_URI: env.MONGO_URI,
        JWT_SECRET: env.JWT_SECRET,
        ...env,
    } as Record<string | undefined, string | undefined> & {
        MONGO_URI: string;
        JWT_SECRET: string;
    };
}
