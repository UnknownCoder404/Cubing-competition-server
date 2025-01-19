import rateLimit from "express-rate-limit";
import isRateLimitingEnabled from "../config/isRateLimitingEnabled";
import skip from "../middleware/skip";
// Define the rate limit
const generalLimiter = isRateLimitingEnabled
    ? rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 500, // limit each IP to 500 requests per windowMs
          message:
              "Too many requests from this IP, please try again after 15 minutes",
          headers: true, // Send X-RateLimit-* headers with limit and remaining
      })
    : skip;

export default generalLimiter;
