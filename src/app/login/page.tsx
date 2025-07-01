"use client"

import { useState } from "react"
import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';

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
                </CardFooter>
            </Card>
        </div>
    )
}
