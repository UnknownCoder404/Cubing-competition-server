// Empty string or undefined = enabled
// any string other than empty string = disabled
import getEnv from "../utils/getEnv";

const isRateLimitingEnabled = !Boolean(getEnv().DISABLE_RATE_LIMITING);
export default isRateLimitingEnabled;
