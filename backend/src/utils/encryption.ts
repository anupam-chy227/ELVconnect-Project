import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export const encrypt = (plainText: string, keyHex: string): string => {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), encrypted.toString('hex'), authTag.toString('hex')].join(':');
};

export const decrypt = (encryptedText: string, keyHex: string): string => {
  const [ivHex, encHex, tagHex] = encryptedText.split(':');
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
};
