import { GITHUB_CONFIG } from '@/consts'
import CryptoJS from 'crypto-js'

const ALGORITHM = 'AES-256-CBC'

export function encryptPrivateKey(privateKey: string, password: string): string {
  const key = CryptoJS.enc.Utf8.parse(password.padEnd(32, '0').slice(0, 32))
  const iv = CryptoJS.lib.WordArray.random(16)
  const encrypted = CryptoJS.AES.encrypt(privateKey, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString()
}

export function decryptPrivateKey(encryptedData: string, password: string): string {
  const key = CryptoJS.enc.Utf8.parse(password.padEnd(32, '0').slice(0, 32))
  const [ivBase64, encrypted] = encryptedData.split(':')
  const iv = CryptoJS.enc.Base64.parse(ivBase64)
  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export function storeEncryptedKey(encryptedKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('github_private_key', encryptedKey)
  }
}

export function getStoredEncryptedKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('github_private_key')
  }
  return null
}

export function clearStoredKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('github_private_key')
  }
}
