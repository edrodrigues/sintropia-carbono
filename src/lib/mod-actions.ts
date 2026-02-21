'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function banUser(
  userId: string,
  reason: string,
  duration: '7days' | 'permanent'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (!currentUser) {
    return { success: false, error: 'Usuário não autenticado' };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();
  
  if (!profile || !['moderator', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Sem permissão para banir usuários' };
  }
  
  if (!reason.trim()) {
    return { success: false, error: 'Motivo do banimento é obrigatório' };
  }
  
  const expiresAt = duration === 'permanent' 
    ? null 
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { error: banError } = await supabase.from('bans').insert({
    user_id: userId,
    moderator_id: currentUser.id,
    reason: reason.trim(),
    expires_at: expiresAt,
  });
  
  if (banError) {
    console.error('Ban error:', banError);
    return { success: false, error: 'Erro ao criar banimento' };
  }
  
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'banned' })
    .eq('id', userId);
  
  if (profileError) {
    console.error('Profile update error:', profileError);
    return { success: false, error: 'Erro ao atualizar perfil' };
  }
  
  revalidatePath('/mod');
  revalidatePath('/profiles');
  
  return { success: true };
}
