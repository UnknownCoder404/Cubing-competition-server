import { Response } from "express"; // Or any other response type you are using

interface ValidationErrorResponse {
    message: string;
}

export function checkUsernameAndPassword(
    username: string | undefined,
    password: string | undefined,
    res: Response<ValidationErrorResponse>,
): Response<ValidationErrorResponse> | undefined {
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Korisničko ime i lozinka su obavezni." });
    }
    if (typeof username !== "string" || typeof password !== "string") {
        return res
            .status(400)
            .json({ message: "Korisničko ime ili lozinka nije tekst." });
    }
    return undefined; // Explicitly return undefined when no error
}

export function checkUsernameLength(
    username: string,
    res: Response<ValidationErrorResponse>,
): Response<ValidationErrorResponse> | undefined {
    if (username.length < 5) {
        return res
            .status(400)
            .json({ message: "Korisničko ime mora biti duže od 4 znaka." });
    }
    if (username.length > 20) {
        return res
            .status(400)
            .json({ message: "Korisničko ime mora biti manje od 20 znaka." });
    }
    return undefined;
}

export function checkPasswordLength(
    password: string,
    res: Response<ValidationErrorResponse>,
): Response<ValidationErrorResponse> | undefined {
    if (password.length < 8) {
        return res
            .status(400)
            .json({ message: "Lozinka mora biti duža od 7 znakova." });
    }
    if (password.length > 15) {
        return res
            .status(400)
            .json({ message: "Lozinka mora biti manje od 15 znakova." });
    }
    return undefined;
}

export function checkUsernameAndPasswordEquality(
    username: string,
    password: string,
    res: Response<ValidationErrorResponse>,
): Response<ValidationErrorResponse> | undefined {
    if (username === password) {
        return res
            .status(400)
            .json({ message: "Korisničko ime i lozinka ne smiju biti isti." });
    }
    return undefined;
}

export function checkGroup(
    group: number,
    res: Response<ValidationErrorResponse>,
): Response<ValidationErrorResponse> | undefined {
    if (group !== 1 && group !== 2) {
        return res.status(400).json({ message: "Grupa mora biti 1 ili 2." });
    }
    return undefined;
}

export function checkPasswordSpaces(
    password: string,
    res: Response<ValidationErrorResponse>,
): Response<ValidationErrorResponse> | undefined {
    if (password.includes(" ")) {
        // Simplified space check
        return res
            .status(400)
            .json({ message: "Lozinka ne smije koristiti razmak." });
    }
    return undefined;
}
