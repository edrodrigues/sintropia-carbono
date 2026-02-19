'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { sendWelcomeEmail } from '@/lib/email';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        redirect('/login?error=' + encodeURIComponent(error.message));
    }

    redirect('/');
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
                username: username,
                user_type: formData.get('user_type') as string || 'individual',
            },
            emailRedirectTo: `${(await headers()).get('origin')}/auth/callback`,
        },
    });

    if (error) {
        redirect('/register?error=' + encodeURIComponent(error.message));
    }

    // Send welcome email (non-blocking, don't wait)
    sendWelcomeEmail(email, name || 'Usuario').catch(console.error);

    redirect('/login?message=Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    // Sign out any existing session to avoid stale token issues
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        redirect('/login?error=' + encodeURIComponent(error.message));
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function signInWithLinkedIn() {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        redirect('/login?error=' + encodeURIComponent(error.message));
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const origin = (await headers()).get('origin');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/confirm?type=recovery`,
    });

    if (error) {
        redirect('/forgot-password?error=' + encodeURIComponent(error.message));
    }

    redirect('/forgot-password?message=E-mail de recuperação enviado! Verifique sua caixa de entrada.');
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        redirect('/auth/reset-password?error=' + encodeURIComponent(error.message));
    }

    redirect('/login?message=Senha atualizada com sucesso!');
}
