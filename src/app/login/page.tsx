
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if the user is blocked before allowing login
            const userDocRef = doc(db, 'users', user.uid);
            try {
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists() && userDoc.data().isBlocked) {
                    const isSuperAdmin = !!user.email && ['canalfladez@gmail.com', 'rcorreas@gmail.com'].includes(user.email);
                    if (!isSuperAdmin) {
                        await auth.signOut(); // Sign out the user immediately
                        setLoading(false);
                        toast({
                            title: "Acesso Bloqueado",
                            description: "Sua conta foi bloqueada por um administrador. Entre em contato com o suporte.",
                            variant: "destructive",
                        });
                        return;
                    }
                }
            } catch (err) {
                console.warn("Erro ao ler documento de usuário no login (pode ser permissão do Firestore):", err);
            }
            
            router.push('/');
            
        } catch (e: any) {
            console.error(e);
            let errorMessage = 'Ocorreu um erro ao tentar fazer login.';
            if (e.code) {
                switch (e.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        errorMessage = 'E-mail ou senha inválidos.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'O formato do e-mail é inválido.';
                        break;
                     case 'auth/too-many-requests':
                        errorMessage = 'Acesso temporariamente bloqueado devido a muitas tentativas. Tente novamente mais tarde.';
                        break;
                }
            }
             toast({
                title: "Erro de Login",
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
                <form onSubmit={handleLogin}>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>
                            Entre com seu e-mail para acessar sua conta
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link 
                                    href="/recuperar-senha" 
                                    className="text-xs text-muted-foreground underline hover:text-primary"
                                >
                                    Esqueceu sua senha?
                                </Link>
                            </div>
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
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : 'Entrar'}
                        </Button>
                         <p className="text-xs text-center text-muted-foreground">
                            Não tem uma conta?{' '}
                            <Link href="/register" className="underline hover:text-primary">
                                Cadastre-se
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
