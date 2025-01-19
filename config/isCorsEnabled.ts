// Empty string or undefined = enabled
// any string other than empty string = disabled
import { config } from "dotenv";
config();
const isCorsEnabled = !Boolean(process.env.DISABLE_CORS);
export default isCorsEnabled;
