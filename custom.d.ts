declare namespace Express {
    export interface Request {
        userId?: string;
        userRole?: "admin" | "user";
        user?: any;
    }
}
