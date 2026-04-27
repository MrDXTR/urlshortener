import "server-only";

import crypto from "crypto";
import type { ShortenedURL } from "@prisma/client";

import { env } from "~/env";
import type { db } from "~/server/db";

type UrlRecord = {
  id: string;
  slug: string;
  longUrl: string | null;
  longUrlEncrypted: string | null;
  longUrlIv: string | null;
  longUrlTag: string | null;
  longUrlHash: string | null;
  createdAt: Date;
  clicks: number;
  userId: string | null;
};

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const URL_ENCRYPTION_KEY_BYTES = 32;

let cachedKey: Buffer | null = null;

function getEncryptionKey() {
  if (cachedKey) {
    return cachedKey;
  }

  const key = Buffer.from(env.URL_ENCRYPTION_KEY, "base64");

  if (key.length !== URL_ENCRYPTION_KEY_BYTES) {
    throw new Error(
      "URL_ENCRYPTION_KEY must be a base64-encoded 32-byte key",
    );
  }

  cachedKey = key;
  return cachedKey;
}

export function hashUrl(url: string) {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export function encryptUrl(url: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    getEncryptionKey(),
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(url, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    longUrlEncrypted: encrypted.toString("base64"),
    longUrlIv: iv.toString("base64"),
    longUrlTag: tag.toString("base64"),
    longUrlHash: hashUrl(url),
  };
}

export function decryptUrl(
  record: Pick<UrlRecord, "longUrlEncrypted" | "longUrlIv" | "longUrlTag">,
) {
  if (!record.longUrlEncrypted || !record.longUrlIv || !record.longUrlTag) {
    throw new Error("Encrypted URL is missing required fields");
  }

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    getEncryptionKey(),
    Buffer.from(record.longUrlIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(record.longUrlTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(record.longUrlEncrypted, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

function getStoredLongUrl(record: UrlRecord) {
  if (record.longUrlEncrypted && record.longUrlIv && record.longUrlTag) {
    return decryptUrl(record);
  }

  if (record.longUrl) {
    return record.longUrl;
  }

  throw new Error(`No URL destination stored for slug ${record.slug}`);
}

type DbClient = Pick<typeof db, "shortenedURL">;

export async function resolveLongUrl(
  db: DbClient,
  record: UrlRecord,
) {
  const longUrl = getStoredLongUrl(record);

  if (!record.longUrlEncrypted || !record.longUrlIv || !record.longUrlTag) {
    const encryptedFields = encryptUrl(longUrl);
    await db.shortenedURL.update({
      where: { id: record.id },
      data: {
        ...encryptedFields,
        longUrl: null,
      },
    });
  }

  return longUrl;
}

export async function resolveUrlRecord(
  db: DbClient,
  record: UrlRecord,
) {
  const longUrl = await resolveLongUrl(db, record);

  return {
    ...record,
    longUrl,
  };
}
