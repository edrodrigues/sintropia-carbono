import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from '@/app/(dashboard)/profile/ProfileForm';

export default async function ProfilePage() {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-[#1e40af] mb-3 dark:text-blue-400">Seu Perfil</h2>
        <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações pessoais e como elas aparecem na plataforma.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-[#1e40af] border-4 border-white dark:border-gray-900 shadow-xl flex items-center justify-center text-4xl text-white font-bold">
              {profile?.display_name?.substring(0, 1).toUpperCase() || user.email?.substring(0, 1).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-12 px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profile?.display_name || profile?.username || 'Usuário'}
              </h3>
              <p className="text-gray-500">@{profile?.username}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">Karma</p>
                <p className="text-2xl font-black text-yellow-700 dark:text-yellow-500">{profile?.karma || 0}</p>
              </div>
              <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Membro desde</p>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-500">
                  {new Date(profile?.created_at).getFullYear()}
                </p>
              </div>
            </div>
          </div>

          <ProfileForm profile={profile} email={user.email!} />
        </div>
      </div>
    </div>
  );
}
