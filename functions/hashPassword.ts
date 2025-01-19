import { hash } from "bcrypt";
const saltRounds = 10;
const hashPassword = async (plainPassword: string) => {
    try {
        console.time("Hashing password");
        const hashedPassword = await hash(plainPassword, saltRounds);
        console.timeEnd("Hashing password");
        return hashedPassword;
    } catch (err) {
        console.error("Error hashing password:", err);
        throw new Error("Hashing failed");
    }
};
export default hashPassword;
