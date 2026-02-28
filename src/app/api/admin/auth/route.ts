import { NextRequest, NextResponse } from 'next/server'
import { createToken, verifyToken } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body
    
    if (!password) {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 })
    }
    
    const token = createToken(password)
    
    if (!token) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }
    
    return NextResponse.json({ 
      success: true, 
      token,
      message: '登录成功' 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    
    const valid = verifyToken(token)
    
    return NextResponse.json({ authenticated: valid })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ success: true, message: '已登出' })
}
