import "express-session";

declare module "express-session" {
    interface SessionData {
        user?: {
            id: string;
            role: "admin" | "user";
            username: string;
        };
    }
}

declare global {
    namespace Express {
        interface Request {
            // Deprecated direct user properties (consider using session instead)
            userId?: string;
            userRole?: "admin" | "user";
            user?: any; // Keep this if you still need it elsewhere
        }
    }
}
