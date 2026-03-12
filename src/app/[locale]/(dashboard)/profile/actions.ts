'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isValidUsername } from '@/lib/utils/sanitize';

export async function updateProfile(formData: FormData) {
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não encontrado. Faça login novamente.' };
    }

    const username = (formData.get('username') as string)?.trim();
    const displayName = (formData.get('display_name') as string)?.trim();
    const bio = (formData.get('bio') as string)?.trim();
    const userType = formData.get('user_type') as string;
    const organization = (formData.get('organization') as string)?.trim();
    const cargo = (formData.get('cargo') as string)?.trim();
    const linkedinUrl = (formData.get('linkedin_url') as string)?.trim();
    const twitterUrl = (formData.get('twitter_url') as string)?.trim();

    // Validation
    if (username && !isValidUsername(username)) {
        return { error: 'Nome de usuário deve ter entre 3 e 30 caracteres e conter apenas letras, números, underscores e hífens' };
    }

    if (displayName && displayName.length > 50) {
        return { error: 'Nome de exibição deve ter no máximo 50 caracteres' };
    }

    if (bio && bio.length > 1000) {
        return { error: 'Bio deve ter no máximo 1000 caracteres' };
    }

    if (organization && organization.length > 100) {
        return { error: 'Organização deve ter no máximo 100 caracteres' };
    }

    if (cargo && cargo.length > 100) {
        return { error: 'Cargo deve ter no máximo 100 caracteres' };
    }

    if (linkedinUrl && linkedinUrl.length > 500) {
        return { error: 'URL do LinkedIn deve ter no máximo 500 caracteres' };
    }

    if (twitterUrl && twitterUrl.length > 500) {
        return { error: 'URL do Twitter/X deve ter no máximo 500 caracteres' };
    }

    // Check if profile exists
    const { data: existingProfile }: any = await supabase
        .from('profiles')
        .select('id, username, referral_reward_claimed, referred_by')
        .eq('id', user.id)
        .single();

    // Ensure username is provided if it doesn't exist yet
    if (!username && !existingProfile?.username) {
        return { error: 'O nome de usuário é obrigatório.' };
    }

    // Sanitize inputs
    const updates: any = {
        id: user.id,
        username: username || existingProfile?.username || '',
        display_name: displayName || null,
        bio: bio || null,
        user_type: ['company', 'ong', 'government', 'professor'].includes(userType) ? userType : 'individual',
        organization: organization || null,
        cargo: cargo || null,
        linkedin_url: linkedinUrl || null,
        twitter_url: twitterUrl || null,
        updated_at: new Date().toISOString(),
    };

    let error;

    if (existingProfile) {
        // Update existing profile
        const result = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select();
        error = result.error;
    } else {
        // Insert new profile
        const result = await supabase
            .from('profiles')
            .insert(updates)
            .select();
        error = result.error;
    }

    if (error) {
        console.error('Error updating profile:', error);

        // Check for specific error types
        if (error.message.includes('duplicate key')) {
            return { error: 'Este nome de usuário já está em uso' };
        }
        if (error.message.includes('row-level security')) {
            return { error: 'Permissão negada. Tente fazer login novamente.' };
        }
        return { error: `Erro ao salvar: ${error.message}` };
    }

    // Check for referral reward
    if (existingProfile?.referred_by && !existingProfile.referral_reward_claimed) {
        // If profile is now complete (has username and display name)
        if (updates.username && updates.display_name) {
             const { data: claimResult, error: claimError } = await supabase
                .rpc('claim_referral_reward', { p_user_id: user.id });

             if (claimError) {
                 console.error('Error claiming referral reward:', claimError);
             } else {
                 console.log('Referral reward claim result:', claimResult);
             }
        }
    }

    revalidatePath('/profile');
    return { success: true };
}
