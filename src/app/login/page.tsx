"use client"

import { useState } from "react"
import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const handleLogin = async () => {
        setIsLoading(true)
        try {
            const result = await login(email, password)
            if (!result.success) {
                toast.error(result.message)
            } else {
                toast.success(result.message)
                router.push('/game')
            }
        } catch (error: any) {
            toast.error(error?.message || "Login failed")
            console.error("Login failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignup = async () => {
        setIsLoading(true)
        try {
            const result = await signup(email, password)
            if (!result.success) {
                toast.error(result.message)
            } else {
                toast.success(result.message)
                router.push('/game')
            }
        } catch (error: any) {
            toast.error(error?.message || "Signup failed")
            console.error("Signup failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignin = async () => {
        setIsLoading(true)
        try {
            const baseUrl = window.location.origin;
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${baseUrl}/game`,
                },
            })
        } catch (error: any) {
            toast.error(error?.message || "Google sign-in failed")
            console.error("Google sign-in failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">Enter your email and password to sign in</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="auth-form" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                        {isLoading ? "Loading..." : "Login"}
                    </Button>
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleSignup} disabled={isLoading}>
                        Create an account
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        disabled={isLoading}
                        onClick={handleGoogleSignin}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 48 48"
                        >
                            <g>
                                <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.69 30.45 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.19C12.36 13.62 17.74 9.5 24 9.5z" />
                                <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.17 5.38-4.62 7.04l7.19 5.59C43.91 37.13 46.1 31.36 46.1 24.55z" />
                                <path fill="#FBBC05" d="M10.67 28.28A14.5 14.5 0 0 1 9.5 24c0-1.49.25-2.93.7-4.28l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.5 10.47l8.17-6.19z" />
                                <path fill="#EA4335" d="M24 48c6.45 0 11.85-2.13 15.8-5.81l-7.19-5.59c-2 1.34-4.56 2.13-8.61 2.13-6.26 0-11.64-4.12-13.64-9.72l-8.17 6.19C6.73 42.2 14.82 48 24 48z" />
                                <path fill="none" d="M0 0h48v48H0z" />
                            </g>
                        </svg>
                        Sign in with Google
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
