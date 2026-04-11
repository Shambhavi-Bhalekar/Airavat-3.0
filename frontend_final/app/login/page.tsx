"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Mail, Lock, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "coordinator" ? "coordinator" : "paralegal"
  
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(defaultRole)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      if (role === "paralegal") {
        router.push("/paralegal")
      } else {
        router.push("/coordinator")
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EE]">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6A7A] hover:text-[#1B3A6B] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B3A6B] shadow-lg mb-4">
              <Shield className="h-7 w-7 text-[#C9A84C]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1B3A6B]">Welcome back</h1>
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
                    className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white text-[#5A6A7A] transition-all"
                  >
                    Paralegal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="coordinator"
                    className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white text-[#5A6A7A] transition-all"
                  >
                    Coordinator
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <TabsContent value="paralegal" className="space-y-4 mt-0 border-0 p-0">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#1B3A6B]">Email or Employee ID</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                        <Input 
                          id="email" 
                          placeholder="paralegal@dlsa.up.gov.in" 
                          className="pl-10 border-[#D4D0C5] focus:border-[#1B3A6B]" 
                          required 
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="coordinator" className="space-y-4 mt-0 border-0 p-0">
                    <div className="space-y-2">
                      <Label htmlFor="email-coord" className="text-[#1B3A6B]">Official Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                        <Input 
                          id="email-coord" 
                          placeholder="coordinator@slsa.up.gov.in" 
                          className="pl-10 border-[#D4D0C5] focus:border-[#1B3A6B]" 
                          required 
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[#1B3A6B]">Password</Label>
                      <Link href="#" className="text-xs font-medium text-[#C9A84C] hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="password" 
                        type="password" 
                        className="pl-10 border-[#D4D0C5] focus:border-[#1B3A6B]" 
                        required 
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#1B3A6B] hover:bg-[#2A4A7B] text-white mt-6 h-11" 
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
                  <Link href={`/signup?role=${role}`} className="font-semibold text-[#1B3A6B] hover:underline">
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
