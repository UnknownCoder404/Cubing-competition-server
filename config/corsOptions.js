function matchesPrLink(url) {
    try {
        // Parse the URL
        const parsedUrl = new URL(url);

        // Check if the URL starts with "https://"
        if (parsedUrl.protocol !== "https:") return false;

        // Check if the hostname ends with "vercel.app"
        const host = parsedUrl.hostname;
        if (!host.endsWith(".vercel.app")) return false;

        // Validate specific prefix structure
        const subdomainParts = host.split(".")[0].split("-");
        if (subdomainParts.length < 4) return false;

        // Ensure prefix starts with "cubing-competition-nextjs-git"
        const prefix = subdomainParts.slice(0, 4).join("-");
        if (prefix !== "cro-cube-comp-git") return false;

        // Validate alphanumeric parts in the subdomain
        const identifier = subdomainParts[4];
        if (!/^[a-zA-Z0-9]+$/.test(identifier)) return false;

        return true; // All checks passed
    } catch (e) {
        // If URL parsing fails, it's invalid
        return false;
    }
}

// Define the list of allowed origins
const allowedOrigins = [
    "http://localhost:2500",
    "http://127.0.0.1:2500",
    "https://cro-cube-comp.github.io",
    "https://cro-cube-comp.vercel.app",
];

// CORS middleware function to check the origin against the allowed list
const corsOptions = {
    origin: function (origin, callback) {
        if (
            allowedOrigins.indexOf(origin) !== -1 ||
            !origin ||
            matchesPrLink(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    optionsSuccessStatus: 200, // For legacy browser support
};

module.exports = corsOptions;
