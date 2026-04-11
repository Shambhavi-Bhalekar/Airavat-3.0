"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Mail, Lock, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { BASE_URL } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "coordinator" ? "coordinator" : "paralegal"
  
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(defaultRole)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.detail ?? `Login failed (${response.status})`)
      }

      const nextPath = data?.redirect_to ?? (role === "coordinator" ? "/coordinator" : "/paralegal")
      router.push(nextPath)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EE]">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6A7A] hover:text-navy transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy shadow-lg">
              <Shield className="h-7 w-7 text-gold" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">Welcome back</h1>
            <p className="text-sm text-[#5A6A7A] mt-2">
              Sign in to your JusticeGrid account
            </p>
          </div>

          <Card className="border-[#D4D0C5] shadow-md bg-white">
            <Tabs defaultValue={role} onValueChange={setRole} className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 bg-[#F5F3EE] p-1">
                  <TabsTrigger 
                    value="paralegal"
                    className="text-[#5A6A7A] transition-all data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    Paralegal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="coordinator"
                    className="text-[#5A6A7A] transition-all data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    Coordinator
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-navy">
                      {role === "paralegal" ? "Email or Employee ID" : "Official Email"}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={role === "paralegal" ? "paralegal@dlsa.up.gov.in" : "coordinator@slsa.up.gov.in"}
                        className="border-[#D4D0C5] pl-10 focus:border-navy"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-navy">Password</Label>
                      <Link href="#" className="text-xs font-medium text-gold hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="password" 
                        type="password" 
                        className="border-[#D4D0C5] pl-10 focus:border-navy"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  {errorMessage ? (
                    <p className="text-sm text-[#B91C1C]">{errorMessage}</p>
                  ) : null}

                  <Button 
                    className="mt-6 h-11 w-full bg-navy text-white hover:bg-navy-light"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-[#F5F3EE] pt-6 pb-6">
                <p className="text-sm text-[#5A6A7A]">
                  Don't have an account?{" "}
                  <Link href={`/signup?role=${role}`} className="font-semibold text-navy hover:underline">
                    Request access
                  </Link>
                </p>
              </CardFooter>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
