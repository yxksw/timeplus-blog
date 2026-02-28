import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'timeplus-secret-key-change-in-production'

export function createToken(password: string): string | null {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
  if (password !== ADMIN_PASSWORD) return null
  
  const payload = {
    exp: Date.now() + 24 * 60 * 60 * 1000,
    iat: Date.now(),
  }
  
  const data = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('hex')
  
  return `${data}.${signature}`
}

export function verifyToken(token: string): boolean {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return false
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('hex')
    
    if (signature !== expectedSignature) return false
    
    const payload = JSON.parse(Buffer.from(data, 'base64').toString())
    return payload.exp > Date.now()
  } catch {
    return false
  }
}
