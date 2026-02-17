'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sanitizeInput, isValidUsername } from '@/lib/utils/sanitize';

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
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

    // Validation
    if (username && !isValidUsername(username)) {
        return { error: 'Nome de usuário deve ter entre 3 e 30 caracteres e conter apenas letras, números, underscores e hífens' };
    }

    if (displayName && displayName.length > 50) {
        return { error: 'Nome de exibição deve ter no máximo 50 caracteres' };
    }

    if (bio && bio.length > 500) {
        return { error: 'Bio deve ter no máximo 500 caracteres' };
    }

    if (organization && organization.length > 100) {
        return { error: 'Organização deve ter no máximo 100 caracteres' };
    }

    if (cargo && cargo.length > 100) {
        return { error: 'Cargo deve ter no máximo 100 caracteres' };
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    // Sanitize inputs
    const updates = {
        id: user.id,
        username: username || null,
        display_name: displayName || null,
        bio: bio || null,
        user_type: ['company', 'ong', 'government'].includes(userType) ? userType : 'individual',
        organization: organization || null,
        cargo: cargo || null,
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

    revalidatePath('/profile');
    return { success: true };
}
