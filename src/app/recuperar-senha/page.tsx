
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RecuperarSenhaPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setEmailSent(true);
            toast({
                title: "E-mail enviado!",
                description: "Verifique sua caixa de entrada para redefinir sua senha.",
            });
        } catch (e: any) {
            console.error(e);
            let errorMessage = 'Ocorreu um erro ao enviar o e-mail de recuperação.';
            if (e.code) {
                switch (e.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'Não existe uma conta com este e-mail.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'O formato do e-mail é inválido.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
                        break;
                }
            }
            toast({
                title: "Erro",
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
                {emailSent ? (
                    <>
                        <CardHeader className="space-y-1 text-center">
                            <div className="flex justify-center mb-2">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl font-bold">E-mail Enviado!</CardTitle>
                            <CardDescription>
                                Enviamos um link de recuperação para <strong>{email}</strong>. 
                                Verifique sua caixa de entrada e a pasta de spam.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-col gap-4">
                            <Button 
                                className="w-full hover:bg-black" 
                                variant="outline" 
                                onClick={() => setEmailSent(false)}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar novamente
                            </Button>
                            <Link href="/login" className="text-xs text-center text-muted-foreground underline hover:text-primary" target="_blank">
                                <ArrowLeft className="inline mr-1 h-3 w-3" />
                                Voltar para o Login
                            </Link>
                        </CardFooter>
                    </>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
                            <CardDescription>
                                Informe seu e-mail e enviaremos um link para redefinir sua senha.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    name="email" 
                                    placeholder="seu@email.com" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full hover:bg-black" type="submit" disabled={loading}>
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar Link de Recuperação'}
                            </Button>
                            <Link href="/login" className="text-xs text-center text-muted-foreground underline hover:text-primary" target="_blank">
                                <ArrowLeft className="inline mr-1 h-3 w-3" />
                                Voltar para o Login
                            </Link>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
