"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGoogleRegister = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            // Se o usuário não existir no Firestore, cria
            if (!userDoc.exists()) {
                const nameParts = user.displayName?.split(' ') || [];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                await setDoc(userDocRef, {
                    email: user.email,
                    role: 'user',
                    createdAt: serverTimestamp(),
                    firstName: firstName,
                    lastName: lastName,
                    username: user.email?.split('@')[0] || '',
                    dob: null,
                    photoURL: user.photoURL || null,
                });
            } else if (userDoc.data().isBlocked) {
                const isSuperAdmin = !!user.email && ['canalfladez@gmail.com', 'rcorreas@gmail.com'].includes(user.email);
                if (!isSuperAdmin) {
                    await auth.signOut();
                    setLoading(false);
                    toast({
                        title: "Acesso Bloqueado",
                        description: "Esta conta está bloqueada no sistema.",
                        variant: "destructive",
                    });
                    return;
                }
            }

            toast({
                title: "Sucesso!",
                description: "Conta criada/conectada com sucesso!",
            });
            router.push('/');
        } catch (e: any) {
            console.error("Google Register Error:", e);
            let errorMessage = 'Ocorreu um erro ao cadastrar-se com o Google.';
            if (e.code === 'auth/popup-closed-by-user') {
                errorMessage = 'O cadastro foi cancelado antes de ser concluído.';
            } else if (e.code === 'auth/operation-not-allowed') {
                errorMessage = 'O login com Google não está ativado no Firebase. Ative-o no console.';
            } else if (e.code === 'auth/unauthorized-domain') {
                errorMessage = 'Este domínio não está autorizado no Firebase para fazer login.';
            } else if (e.message) {
                errorMessage += ` (${e.code || e.message})`;
            }
            toast({
                title: "Erro no Cadastro",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password.length < 6) {
            toast({
                title: "Erro de Cadastro",
                description: "A senha deve ter pelo menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                role: 'user',
                createdAt: serverTimestamp(),
                firstName: '',
                lastName: '',
                username: '',
                dob: null,
                photoURL: null,
            });
            
            router.push('/');

        } catch (e: any) {
            console.error("Error creating user: ", e);
            let errorMessage = 'Ocorreu um erro ao tentar criar a conta.';
            if (e.code) {
                switch (e.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'Este e-mail já está em uso.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'O formato do e-mail é inválido.';
                        break;
                }
            }
            toast({
                title: "Erro de Cadastro",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleRegister}>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                        <CardDescription>
                            Crie uma conta para se juntar à Nação
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                         <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                name="email" 
                                placeholder="m@example.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="sr-only">{showPassword ? "Ocultar senha" : "Mostrar senha"}</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                         <Button className="w-full hover:bg-black" type="submit" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : 'Criar Conta'}
                        </Button>
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                            </div>
                        </div>
                        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleRegister} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                            )}
                            Google
                        </Button>
                         <p className="text-xs text-center text-muted-foreground">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="underline hover:text-primary">
                                Entrar
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
