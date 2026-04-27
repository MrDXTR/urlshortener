import crypto from "crypto";

import { db } from "~/server/db";

const API_KEY_PREFIX = "sk_";

export function generateApiKey(): string {
  return `${API_KEY_PREFIX}${crypto.randomBytes(24).toString("hex")}`;
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function getValidApiKey(key: string) {
  try {
    const keyHash = hashApiKey(key);
    const apiKey = await db.apiKey.findFirst({
      where: {
        keyHash,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (apiKey) {
      return { status: "valid" as const, apiKey };
    }

    const legacyApiKey = await db.apiKey.findFirst({
      where: {
        key,
        revoked: false,
      },
      select: { id: true },
    });

    if (legacyApiKey) {
      return { status: "legacy" as const };
    }

    return { status: "invalid" as const };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { status: "invalid" as const };
  }
}

export async function createApiKey(
  userId: string,
  name: string,
  expiresInDays?: number,
) {
  const key = generateApiKey();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const apiKey = await db.apiKey.create({
    data: {
      keyHash: hashApiKey(key),
      key: null,
      name,
      userId,
      expiresAt,
    },
  });

  return {
    key,
    apiKey,
  };
}

export async function revokeApiKey(id: string, userId: string) {
  return db.apiKey.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      revoked: true,
    },
  });
}

export async function getUserApiKeys(userId: string) {
  const apiKeys = await db.apiKey.findMany({
    where: {
      userId,
      revoked: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return apiKeys.map(({ key, keyHash, ...apiKey }) => ({
    ...apiKey,
    isLegacy: Boolean(key && !keyHash),
  }));
}
