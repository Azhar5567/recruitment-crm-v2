import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import path from 'path'

let adminDb: FirebaseFirestore.Firestore

try {
  // Check if Firebase Admin is already initialized
  if (getApps().length === 0) {
    // Check if required environment variables are present
    const requiredEnvVars = [
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'FIREBASE_CLIENT_CERT_URL'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars)
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }
    
    // Use environment variables for service account credentials
    const serviceAccount = {
      type: "service_account",
      project_id: "recruitment-crm-3dd5d",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: "googleapis.com"
    }
    
    initializeApp({
      credential: cert(serviceAccount as any),
      projectId: "recruitment-crm-3dd5d",
    })
  }

  adminDb = getFirestore()
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Firebase Admin initialized successfully')
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error)
  // Create a fallback mock database for development
  console.log('Creating fallback mock database...')
  adminDb = {
    collection: () => ({
      where: () => ({
        get: () => Promise.resolve({ docs: [] })
      }),
      add: (data: Record<string, unknown>) => {
        console.log('Mock add called with data:', data)
        return Promise.resolve({ id: 'mock-id-' + Date.now() })
      },
      doc: (id: string) => ({
        get: () => Promise.resolve({ 
          exists: true, 
          data: () => ({ id }),
          id 
        })
      })
    })
  } as unknown as FirebaseFirestore.Firestore
}

export { adminDb } 