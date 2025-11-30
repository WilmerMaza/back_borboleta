import { randomUUID } from "crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";


const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
};

// Validaciones mínimas (evita inicializar si falta algo crítico)
[
  "FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL",
].forEach((k) => {
  if (!process.env[k]) {
    throw new Error(`Falta variable de entorno: ${k}`);
  }
});

// Inicializa Admin SDK con el bucket correcto
initializeApp({
  credential: cert(serviceAccount as any),
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "borboleta-f137e.appspot.com",
});

// Usa getStorage() (recomendado en TS/ESM)
const bucket = getStorage().bucket(
  process.env.FIREBASE_STORAGE_BUCKET || "borboleta-f137e.appspot.com"
);

console.log("✅ Firebase Storage (Admin SDK) inicializado");

// ============ Helpers ============
export async function uploadBuffer(
  buffer: Buffer,
  destinationPath: string,
  contentType?: string
) {
  const file = bucket.file(destinationPath);
  const metadata = {
    metadata: { firebaseStorageDownloadTokens: randomUUID() },
    contentType: contentType || "application/octet-stream",
    cacheControl: "public, max-age=31536000",
  };

  await file.save(buffer, { metadata, resumable: false });
  return { path: destinationPath };
}

export async function getSignedUrl(
  path: string,
  expiresInMinutes = 60
): Promise<string> {
  const file = bucket.file(path);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMinutes * 60 * 1000, // o usa new Date(Date.now() + …)
  });
  return url;
}

export async function deleteFile(path: string) {
  await bucket.file(path).delete({ ignoreNotFound: true });
  return { success: true, deleted: true };
}

// Compat
export const uploadFile = async (
  file: Buffer,
  path: string,
  contentType: string
) => {
  try {
    const result = await uploadBuffer(file, path, contentType);
    const url = await getSignedUrl(path, 525600); // 1 año
    return { success: true, url, path: result.path };
  } catch (error: any) {
    console.error("Error al subir archivo:", error);
    return { success: false, error: error.message };
  }
};

export const getFileURL = async (path: string) => {
  try {
    const url = await getSignedUrl(path, 525600);
    return { success: true, url };
  } catch (error: any) {
    console.error("Error al obtener URL:", error);
    return { success: false, error: error.message };
  }
};
