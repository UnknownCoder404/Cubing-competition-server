// Empty string or undefined = enabled
// any string other than empty string = disabled
import { config } from "dotenv";
config();
const isRateLimitingEnabled = !Boolean(process.env.DISABLE_RATE_LIMITING);
export default isRateLimitingEnabled;
