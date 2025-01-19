import { compare } from "bcrypt";
const verifyPassword = async (
    plainPassword: string,
    hashedPassword: string,
) => {
    try {
        const match = await compare(plainPassword, hashedPassword);
        return match;
    } catch (err) {
        console.error("Error verifying password:", err);
        throw new Error("Verification failed");
    }
};
export default verifyPassword;
