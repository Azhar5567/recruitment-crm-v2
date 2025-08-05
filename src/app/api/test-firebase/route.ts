import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(_request: NextRequest) {
  try {
    console.log('=== Firebase Admin Test Started ===')
    
    // Check environment variables first
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
      valueLength: process.env[varName]?.length || 0
    }))
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    console.log('Environment variables status:', envStatus)
    console.log('Missing variables:', missingVars)
    
    if (missingVars.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing environment variables',
        missingVariables: missingVars,
        environmentStatus: envStatus
      }, { status: 500 })
    }
    
    console.log('All environment variables present, testing Firebase Admin connection...')
    
    // Test if we can access the database
    const testCollection = adminDb.collection('test')
    console.log('Test collection accessed successfully')
    
    // Test if we can add a document
    const testDoc = await testCollection.add({
      test: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    })
    console.log('Test document added successfully:', testDoc.id)
    
    // Test if we can read the document back
    const retrievedDoc = await testDoc.get()
    const docData = retrievedDoc.data()
    console.log('Test document retrieved successfully:', docData)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin is working perfectly',
      testDocId: testDoc.id,
      documentData: docData,
      environmentStatus: envStatus
    })
  } catch (error) {
    console.error('=== Firebase Admin Test Failed ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 