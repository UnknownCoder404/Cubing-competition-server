// Route for getting backup
import express from "express";
import fs from "fs";
import path from "path";
const router = express.Router();
import authenticateSession from "../../middleware/authenticateSession";
import isAdmin from "../../utils/helpers/isAdmin";
import archiver from "archiver";

const backupsPath = path.join(__dirname, "../../backups");
const backupPath = path.join(__dirname, "../../backups.zip");
zipFolder(backupsPath, backupPath);

router.get("/", authenticateSession, isAdmin, async (req, res) => {
    try {
        res.status(200).sendFile(backupPath);
        return;
    } catch (error) {
        res.status(500).json({ message: "Error while getting backup" });
        return;
    }
});

function zipFolder(sourceFolder: string, outPath: string) {
    console.time("zipping backups");
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
    });

    output.on("close", () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log(
            "Archiver has been finalized and the output file descriptor has closed.",
        );
    });

    archive.on("error", (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
    console.timeEnd("zipping backups");
}

export default router;
