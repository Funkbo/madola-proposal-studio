import crypto from "crypto";

/**
 * Generate a cryptographically random, unguessable public proposal token.
 * Prevents enumeration and exposure of internal proposal references.
 */
export function generateSecurePublicToken(): string {
  const bytes = crypto.randomBytes(16).toString("hex");
  return `pub_tok_${bytes}`;
}
