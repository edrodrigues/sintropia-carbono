import { createClient } from '@/lib/supabase/server';
import { ProfileCompletionBanner } from '@/components/onboarding/ProfileCompletionBanner';

export async function ProfileCompletionCheck() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

    const missingFields: ('username' | 'display_name')[] = [];

    if (!profile?.username || profile.username.trim().length === 0) {
        missingFields.push('username');
    }
    if (!profile?.display_name || profile.display_name.trim().length === 0) {
        missingFields.push('display_name');
    }

    if (missingFields.length === 0) return null;

    return <ProfileCompletionBanner missingFields={missingFields} />;
}