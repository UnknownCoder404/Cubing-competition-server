const compression = require("compression");
const compressionFilter = (req, res) => {
    if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false;
    }

    // fallback to standard filter function
    return compression.filter(req, res);
};
module.exports = compressionFilter;
