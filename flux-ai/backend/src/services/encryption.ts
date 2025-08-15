import crypto from 'crypto';

export function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY_HEX;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY_HEX must be a 32-byte hex string');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptSecret(plaintext: string): { ciphertext: Buffer; iv: Buffer } {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: Buffer.concat([enc, tag]), iv };
}

export function decryptSecret(ciphertextWithTag: Buffer, iv: Buffer): string {
  const key = getKey();
  const tag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16);
  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return dec.toString('utf8');
}


