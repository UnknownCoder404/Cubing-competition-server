import rateLimit from "express-rate-limit";
import isRateLimitingEnabled from "../config/isRateLimitingEnabled";
import skip from "../middleware/skip";
// Specific rate limit for the login route
const registerLimiter = isRateLimitingEnabled
    ? rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 5, // limit each IP to 5 login requests per windowMs
          message:
              "Too many register attempts, please try again after 15 minutes",
      })
    : skip;
export default registerLimiter;
