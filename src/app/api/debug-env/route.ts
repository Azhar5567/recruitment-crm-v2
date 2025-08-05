import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  const requiredEnvVars = [
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_CERT_URL'
  ]
  
  const envStatus = requiredEnvVars.map(varName => ({
    name: varName,
    present: !!process.env[varName],
    value: process.env[varName] ? '***SET***' : 'MISSING'
  }))
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  return NextResponse.json({
    success: missingVars.length === 0,
    missingVariables: missingVars,
    environmentStatus: envStatus,
    totalRequired: requiredEnvVars.length,
    totalPresent: requiredEnvVars.length - missingVars.length
  })
} 