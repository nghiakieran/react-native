import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
        cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
        // Create unique filename: user-id-timestamp.ext
        const userId = (req as any).userId || "unknown";
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
    },
});

// File filter (images only)
const fileFilter = (_req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png, gif) are allowed"));
    }
};

// Limits
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB
};

export const upload = multer({
    storage,
    fileFilter,
    limits,
});
