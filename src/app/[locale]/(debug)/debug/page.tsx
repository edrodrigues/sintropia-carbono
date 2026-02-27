import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Debug | Sintropia',
};

export default async function DebugPage() {
    const supabase = await createClient();
    const start = Date.now();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const profile = user 
        ? await supabase.from('profiles').select('*').eq('id', user.id).single()
        : { data: null };

    const timings = {
        total: Date.now() - start,
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
            
            <div className="grid gap-6">
                {/* Timing */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Timings</h2>
                    <pre className="text-sm text-green-400">
                        {JSON.stringify(timings, null, 2)}
                    </pre>
                </div>

                {/* Environment */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Environment</h2>
                    <pre className="text-sm text-green-400">
                        {JSON.stringify({
                            NODE_ENV: process.env.NODE_ENV,
                            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                        }, null, 2)}
                    </pre>
                </div>

                {/* Auth */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Authentication</h2>
                    {user ? (
                        <div>
                            <p className="text-green-400 mb-2">✓ Authenticated</p>
                            <pre className="text-sm text-gray-300 overflow-x-auto">
                                {JSON.stringify({
                                    id: user.id,
                                    email: user.email,
                                    email_confirmed_at: user.email_confirmed_at,
                                }, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <p className="text-yellow-400">Not authenticated</p>
                    )}
                    {authError && (
                        <p className="text-red-400 mt-2">Error: {authError.message}</p>
                    )}
                </div>

                {/* Profile */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Profile</h2>
                    {profile.data ? (
                        <pre className="text-sm text-gray-300 overflow-x-auto">
                            {JSON.stringify(profile.data, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-yellow-400">No profile found</p>
                    )}
                    {'error' in profile && profile.error && (
                        <p className="text-red-400 mt-2">Error: {profile.error.message}</p>
                    )}
                </div>

                {/* Request Info */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Request Info</h2>
                    <pre className="text-sm text-gray-300">
                        {JSON.stringify({
                            timestamp: new Date().toISOString(),
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
