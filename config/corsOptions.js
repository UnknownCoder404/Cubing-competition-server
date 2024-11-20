function matchesPrLink(origin) {
    const regex = /^https:\/\/cubing-competition-nextjs-pr-\d+\.onrender\.com$/;

    return regex.test(origin);
}

// Define the list of allowed origins
const allowedOrigins = [
    "http://localhost:2500",
    "http://127.0.0.1:2500",
    "https://cro-cube-comp.github.io",
    "https://cubing-competition-nextjs.onrender.com",
    "https://cubing-competition-nextjs-beta.onrender.com",
    "https://cubing-competition-nextjs.vercel.app",
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
