import { db } from "~/server/db";
import crypto from "crypto";

// Generate a secure random API key
export function generateApiKey(): string {
  return `sk_${crypto.randomBytes(24).toString("hex")}`;
}

// Retrieve and validate an API key
export async function getValidApiKey(key: string) {
  try {
    const apiKey = await db.apiKey.findUnique({
      where: { key },
    });

    if (!apiKey) {
      return null;
    }

    // Check if the key is revoked
    if (apiKey.revoked) {
      return null;
    }

    // Check if the key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    return apiKey;
  } catch (error) {
    console.error("Error validating API key:", error);
    return null;
  }
}

// Create a new API key for a user
export async function createApiKey(
  userId: string,
  name: string,
  expiresInDays?: number,
) {
  const key = generateApiKey();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  return db.apiKey.create({
    data: {
      key,
      name,
      userId,
      expiresAt,
    },
  });
}

// Revoke an API key
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

// Get all API keys for a user
export async function getUserApiKeys(userId: string) {
  return db.apiKey.findMany({
    where: {
      userId,
      revoked: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
