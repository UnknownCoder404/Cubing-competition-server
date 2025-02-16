import { filter, type CompressionFilter } from "compression";
const compressionFilter: CompressionFilter = (req, res) => {
    if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false;
    }

    // fallback to standard filter function
    return filter(req, res);
};
export default compressionFilter;
