/**
 * Unified Marketplace Token Encryption Service
 *
 * This module provides AES-256-GCM encryption for OAuth tokens across all marketplace platforms.
 * Each marketplace uses a provider-specific encryption key from environment variables.
 *
 * Security features:
 * - AES-256-GCM authenticated encryption
 * - Unique IV (initialization vector) for each encryption operation
 * - PBKDF2 key derivation with 100,000 iterations
 * - Salt-based key strengthening
 * - Format: "salt:iv:authTag:encryptedData" (base64 encoded)
 */

import crypto from "node:crypto";
import type { MarketplaceProvider } from "@/types/marketplace";

/**
 * Encryption algorithm configuration
 */
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = "sha256";

/**
 * Get encryption key for a specific marketplace provider
 *
 * @param provider - The marketplace provider
 * @returns The encryption key from environment variables
 * @throws Error if encryption key is not configured
 */
function getEncryptionKey(provider: MarketplaceProvider): string {
  const envKey = `${provider.toUpperCase()}_ENCRYPTION_KEY`;
  const key = process.env[envKey];

  if (!key) {
    throw new Error(
      `Encryption key not configured for ${provider}. Please set ${envKey} environment variable.`,
    );
  }

  return key;
}

/**
 * Derive encryption key from password using PBKDF2
 *
 * @param password - The base encryption key
 * @param salt - Salt for key derivation
 * @returns Derived encryption key
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST,
  );
}

/**
 * Encrypt a token using provider-specific encryption key
 *
 * @param token - The plaintext token to encrypt
 * @param provider - The marketplace provider
 * @returns Encrypted token in format "salt:iv:authTag:encryptedData" (base64 encoded)
 * @throws Error if encryption fails or key is missing
 *
 * @example
 * ```typescript
 * const encrypted = encryptToken("access_token_123", "amazon");
 * // Returns: "base64salt:base64iv:base64tag:base64data"
 * ```
 */
export function encryptToken(
  token: string,
  provider: MarketplaceProvider,
): string {
  try {
    // Get provider-specific encryption key
    const password = getEncryptionKey(provider);

    // Generate unique salt and IV for this operation
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive encryption key from password and salt
    const key = deriveKey(password, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the token
    let encrypted = cipher.update(token, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Return format: salt:iv:authTag:encryptedData (all base64 encoded)
    return [
      salt.toString("base64"),
      iv.toString("base64"),
      authTag.toString("base64"),
      encrypted,
    ].join(":");
  } catch (error) {
    throw new Error(
      `Failed to encrypt token for ${provider}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Decrypt a token using provider-specific encryption key
 *
 * @param encryptedToken - The encrypted token in format "salt:iv:authTag:encryptedData"
 * @param provider - The marketplace provider
 * @returns Decrypted plaintext token
 * @throws Error if decryption fails, format is invalid, or key is wrong
 *
 * @example
 * ```typescript
 * const decrypted = decryptToken("base64salt:base64iv:base64tag:base64data", "amazon");
 * // Returns: "access_token_123"
 * ```
 */
export function decryptToken(
  encryptedToken: string,
  provider: MarketplaceProvider,
): string {
  try {
    // Get provider-specific encryption key
    const password = getEncryptionKey(provider);

    // Parse encrypted token format
    const parts = encryptedToken.split(":");
    if (parts.length !== 4) {
      throw new Error(
        "Invalid encrypted token format. Expected format: salt:iv:authTag:encryptedData",
      );
    }

    const [saltBase64, ivBase64, authTagBase64, encryptedData] = parts;

    // Decode base64 components
    const salt = Buffer.from(saltBase64, "base64");
    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");

    // Validate component lengths
    if (salt.length !== SALT_LENGTH) {
      throw new Error(`Invalid salt length: expected ${SALT_LENGTH} bytes`);
    }
    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes`);
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error(
        `Invalid auth tag length: expected ${AUTH_TAG_LENGTH} bytes`,
      );
    }

    // Derive encryption key from password and salt
    const key = deriveKey(password, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the token
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      `Failed to decrypt token for ${provider}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
