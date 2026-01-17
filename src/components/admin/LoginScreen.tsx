"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, Lock, UserPlus } from "lucide-react";

export function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
                // Auto login happens on success
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Email já cadastrado.");
            } else if (err.code === 'auth/weak-password') {
                setError("A senha deve ter pelo menos 6 caracteres.");
            } else {
                setError("Falha na autenticação. Verifique os dados.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            console.error(err);
            setError("Erro com Google Login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-paper">
            <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-olive/10 text-olive">
                        <Lock size={32} />
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-ink">Kombistyle Admin</h1>
                    <p className="text-sm text-ink2">Área restrita para operação</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/60">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-ink/20 bg-paper2 p-3 text-ink focus:border-olive focus:outline-none"
                            placeholder="batman@kombistyle.com"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/60">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-ink/20 bg-paper2 p-3 text-ink focus:border-olive focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-olive py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? "Processando..." : (isRegistering ? "Criar Conta" : "Entrar com Email")}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="w-full text-xs text-ink/50 hover:text-olive hover:underline"
                    >
                        {isRegistering ? "Já tem conta? Fazer Login" : "Não tem conta? Cadastrar"}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-ink/10" />
                    <span className="text-xs text-ink/40 uppercase">Ou</span>
                    <div className="h-[1px] flex-1 bg-ink/10" />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink/20 bg-white py-3 font-bold text-ink transition-colors hover:bg-paper2"
                >
                    <User size={18} />
                    Entrar com Google
                </button>
            </div>
        </div>
    );
}
