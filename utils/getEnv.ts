export default function getEnv() {
    const env = process.env;

    if (!env.MONGO_URI || !env.SESSION_SECRET) {
        throw new Error(
            "Missing required environment variables: MONGO_URI, SESSION_SECRET",
        );
    }

    return {
        MONGO_URI: env.MONGO_URI,
        SESSION_SECRET: env.SESSION_SECRET,
        ...env,
    } as Record<string, string | undefined> & {
        MONGO_URI: string;
        SESSION_SECRET: string;
    };
}
