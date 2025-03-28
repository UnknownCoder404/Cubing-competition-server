import rateLimit from "express-rate-limit";
import isRateLimitingEnabled from "../config/isRateLimitingEnabled";
import skip from "../middleware/skip";
// Specific rate limit for the login route
const loginLimiter = isRateLimitingEnabled
    ? rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 15, // limit each IP to 15 login requests per windowMs
          message: "Previše pokušaja prijave, pokušajte ponovno za 15 minuta.",
      })
    : skip;
export default loginLimiter;
