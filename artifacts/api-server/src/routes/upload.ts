import { Router, type IRouter } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
  api_key: process.env["CLOUDINARY_API_KEY"],
  api_secret: process.env["CLOUDINARY_API_SECRET"],
});

const memStorage = multer.memoryStorage();

const uploadImage = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas"));
  },
});

const uploadVideo = multer({
  storage: memStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Apenas vídeos são permitidos"));
  },
});

function cloudinaryIsConfigured(): boolean {
  return Boolean(
    process.env["CLOUDINARY_CLOUD_NAME"] &&
      process.env["CLOUDINARY_API_KEY"] &&
      process.env["CLOUDINARY_API_SECRET"],
  );
}

function safeCloudinaryErrorSummary(error: unknown): Record<string, string | number> {
  const details =
    typeof error === "object" && error !== null
      ? (error as { name?: unknown; message?: unknown; http_code?: unknown; code?: unknown })
      : {};
  let message = typeof details.message === "string" ? details.message : "";

  for (const credential of [
    process.env["CLOUDINARY_API_SECRET"],
    process.env["CLOUDINARY_API_KEY"],
  ]) {
    if (credential) message = message.split(credential).join("[redacted]");
  }
  message = message
    .replace(/cloudinary:\/\/[^@\s]+@/gi, "cloudinary://[redacted]@")
    .replace(/(api[_ -]?secret\s*[:=]\s*)[^\s,]+/gi, "$1[redacted]")
    .slice(0, 240);

  return {
    ...(typeof details.name === "string" ? { name: details.name.slice(0, 80) } : {}),
    ...(typeof details.http_code === "number" ? { httpCode: details.http_code } : {}),
    ...(typeof details.code === "string" ? { code: details.code.slice(0, 80) } : {}),
    ...(message ? { message } : {}),
  };
}

function uploadToCloudinary(
  buffer: Buffer,
  resourceType: "image" | "video" | "raw" | "auto"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "o-abstrato-doido" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload falhou"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

const router: IRouter = Router();

router.post("/upload", uploadImage.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "Nenhum ficheiro enviado" });
    return;
  }
  if (!cloudinaryIsConfigured()) {
    res.status(503).json({ error: "Upload indisponível: configure o Cloudinary no ambiente." });
    return;
  }
  try {
    const url = await uploadToCloudinary(req.file.buffer, "image");
    res.json({ url });
  } catch (err) {
    req.log.error(
      {
        cloudinaryError: safeCloudinaryErrorSummary(err),
        resourceType: "image",
        fileSizeBytes: req.file.size,
      },
      "Cloudinary upload failed",
    );
    res.status(500).json({ error: "Erro ao enviar para o Cloudinary" });
  }
});

router.post("/upload/video", uploadVideo.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "Nenhum vídeo enviado" });
    return;
  }
  if (!cloudinaryIsConfigured()) {
    res.status(503).json({ error: "Upload indisponível: configure o Cloudinary no ambiente." });
    return;
  }
  try {
    const url = await uploadToCloudinary(req.file.buffer, "video");
    res.json({ url });
  } catch (err) {
    req.log.error(
      {
        cloudinaryError: safeCloudinaryErrorSummary(err),
        resourceType: "video",
        fileSizeBytes: req.file.size,
      },
      "Cloudinary upload failed",
    );
    res.status(500).json({ error: "Erro ao enviar para o Cloudinary" });
  }
});

export default router;
