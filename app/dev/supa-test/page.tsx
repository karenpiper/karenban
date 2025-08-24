import { createClient } from '@/lib/supabase/server'

export default async function SupaTestPage() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)
    
    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Supabase Test - Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Connection Error:</p>
            <pre className="text-red-700 text-sm mt-2">{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      )
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Test - Success</h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Connection Successful!</p>
          <p className="text-green-700 text-sm mt-2">
            Tasks found: {data?.length || 0}
          </p>
          {data && data.length > 0 && (
            <pre className="text-green-700 text-sm mt-2 bg-white p-2 rounded">
              {JSON.stringify(data[0], null, 2)}
            </pre>
          )}
        </div>
      </div>
    )
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Test - Exception</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Exception occurred:</p>
          <pre className="text-red-700 text-sm mt-2">{String(err)}</pre>
        </div>
      </div>
    )
  }
} 