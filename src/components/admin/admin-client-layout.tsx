"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AdminSidebar } from './admin-sidebar';
import { Loader2 } from 'lucide-react';

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading) {
  //     if (!user || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'superadmin')) {
  //       router.push('/login');
  //     }
  //   }
  // }, [user, userProfile, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando painel administrativo...</div>;
  }

  if (!user || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'superadmin')) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col p-8 bg-zinc-900 text-white">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Erro de Acesso ao Painel</h1>
        <p className="mb-4">Por favor, tire um print (foto) desta tela e me envie, ou copie o texto abaixo:</p>
        <pre className="bg-black text-green-400 p-4 rounded w-full max-w-2xl overflow-auto text-xs">
          {JSON.stringify({ 
            userEmail: user?.email, 
            userId: user?.uid,
            profileExists: !!userProfile,
            profileRole: userProfile?.role,
            loadingState: loading 
          }, null, 2)}
        </pre>
      </div>
    );
  }

  // Verificação de MFA (Múltiplo Fator) de segurança
  // user.multiFactor requer habilitar Identity Platform no Firebase Console.
  // const enrolledFactors = (user as any)?.multiFactor?.enrolledFactors || [];
  // if (enrolledFactors.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen flex-col p-8 bg-zinc-900 text-white">
  //       <h1 className="text-2xl font-bold text-yellow-500 mb-4">MFA Obrigatório</h1>
  //       <p className="mb-4 text-center max-w-md">Sua conta de administrador exige Autenticação em Duas Etapas (MFA) para acessar este painel. Configure no seu perfil.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
