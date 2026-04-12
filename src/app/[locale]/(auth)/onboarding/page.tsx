import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return {
        title: locale === 'pt' ? 'Complete seu perfil | Sintropia' : 'Complete your profile | Sintropia',
        robots: { index: false, follow: false },
    };
}

export default async function OnboardingPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const hasUsername = profile?.username && profile.username.trim().length > 0;
    const hasDisplayName = profile?.display_name && profile.display_name.trim().length > 0;

    if (hasUsername && hasDisplayName) {
        redirect('/dashboard');
    }

    const isNewUser = !hasUsername;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4 py-8">
            <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <OnboardingForm
                    profile={profile}
                    isNewUser={isNewUser}
                />
            </div>
        </div>
    );
}