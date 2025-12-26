'use client';

import Link from 'next/link';
import styles from './auth.module.css';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back!</h1>
                <p className={styles.subtitle}>Log in to continue shopping</p>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <Link href="#" className={styles.forgotPassword}>Forgot Password?</Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <button type="button" className={styles.socialBtn}>
                    Continue with Google
                </button>

                <p className={styles.footerText}>
                    Don't have an account? <Link href="/register" className={styles.link}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
