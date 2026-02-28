import { NextRequest, NextResponse } from 'next/server'
import { GITHUB_CONFIG } from '@/consts'
import { encryptPrivateKey } from '@/lib/aes256-util'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { privateKey, password } = body
    
    if (!privateKey) {
      return NextResponse.json({ error: 'Private key is required' }, { status: 400 })
    }
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }
    
    const encryptedKey = encryptPrivateKey(privateKey, password)
    
    return NextResponse.json({ 
      success: true, 
      encryptedKey,
      message: 'Private key encrypted successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error)
    return NextResponse.json({ error: 'Failed to process authentication' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Logged out successfully' })
}
