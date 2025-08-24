import { createClient } from '@/lib/supabase/server'

export default async function SupaTestPage() {
  let connectionStatus = 'Testing...'
  let errorDetails = ''
  let data: any = null

  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data: testData, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)
    
    if (error) {
      connectionStatus = 'Connection Failed'
      errorDetails = error.message
    } else {
      connectionStatus = 'Connection Successful!'
      data = testData
    }
  } catch (exception: any) {
    connectionStatus = 'Exception Occurred'
    errorDetails = exception.message || 'Unknown error'
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className={`p-6 rounded-lg border-2 ${
        connectionStatus === 'Connection Successful!' 
          ? 'border-green-500 bg-green-50' 
          : 'border-red-500 bg-red-50'
      }`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          connectionStatus === 'Connection Successful!' ? 'text-green-800' : 'text-red-800'
        }`}>
          {connectionStatus}
        </h2>
        
        {errorDetails && (
          <div className="mb-4">
            <h3 className="font-semibold text-red-700 mb-2">Error Details:</h3>
            <pre className="bg-red-100 p-3 rounded text-sm text-red-800 overflow-auto">
              {errorDetails}
            </pre>
          </div>
        )}
        
        {data && (
          <div className="mb-4">
            <h3 className="font-semibold text-green-700 mb-2">Test Query Result:</h3>
            <pre className="bg-green-100 p-3 rounded text-sm text-green-800 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Test Query:</strong> SELECT * FROM tasks LIMIT 1</p>
          <p><strong>Purpose:</strong> Verify database connection and basic table access</p>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">What This Test Verifies:</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>✅ Environment variables are set correctly</li>
          <li>✅ Supabase connection is working</li>
          <li>✅ Database schema is properly set up</li>
          <li>✅ RLS policies allow access</li>
          <li>✅ Server-side Supabase client is functional</li>
        </ul>
      </div>
      
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">Next Steps:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>If connection failed, check your <code>.env.local</code> file</li>
          <li>Verify your Supabase project is active</li>
          <li>Run the database schema in Supabase SQL Editor</li>
          <li>Check RLS policies if you get permission errors</li>
        </ol>
      </div>
    </div>
  )
} 