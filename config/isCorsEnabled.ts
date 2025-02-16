// Empty string or undefined = enabled
// any string other than empty string = disabled
import getEnv from "../utils/getEnv";

const isCorsEnabled = !Boolean(getEnv().DISABLE_CORS);
export default isCorsEnabled;
