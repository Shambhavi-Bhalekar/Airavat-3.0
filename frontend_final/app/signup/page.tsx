"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Mail, Lock, User, MapPin, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "coordinator" ? "coordinator" : "paralegal"
  
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(defaultRole)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate signup request
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
        <Card className="max-w-md w-full border-[#D4D0C5] shadow-lg bg-white p-8 text-center space-y-6 flex flex-col items-center">
          <div className="h-16 w-16 bg-[#166534]/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-[#166534]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1B3A6B]">Request Submitted</h2>
            <p className="text-[#5A6A7A]">
              Your access request for {role === "paralegal" ? "Paralegal" : "UTRC Coordinator"} has been submitted for verification. 
              You will receive an email once your account is approved by the State Legal Services Authority.
            </p>
          </div>
          <Button 
            className="bg-[#1B3A6B] hover:bg-[#2A4A7B] text-white w-full"
            onClick={() => router.push("/")}
          >
            Return to Homepage
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EE]">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6A7A] hover:text-[#1B3A6B] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B3A6B] shadow-lg mb-4">
              <Shield className="h-7 w-7 text-[#C9A84C]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1B3A6B]">Request Access</h1>
            <p className="text-sm text-[#5A6A7A] mt-2">
              Apply for an authorized JusticeGrid account
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
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#1B3A6B]">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="pl-10 border-[#D4D0C5] focus:border-[#1B3A6B]" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-[#1B3A6B]">Assigned District</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A] z-10" />
                      <Select defaultValue="lucknow">
                        <SelectTrigger className="pl-10 border-[#D4D0C5] focus:border-[#1B3A6B]">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#D4D0C5]">
                          <SelectItem value="lucknow">Lucknow</SelectItem>
                          <SelectItem value="varanasi">Varanasi</SelectItem>
                          <SelectItem value="kanpur">Kanpur</SelectItem>
                          <SelectItem value="agra">Agra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1B3A6B]">
                      {role === "paralegal" ? "Email or Employee ID" : "Official Govt. Email"}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="email" 
                        type={role === "coordinator" ? "email" : "text"}
                        placeholder={role === "paralegal" ? "DLSA ID or Email" : "coordinator@slsa.up.gov.in"} 
                        className="pl-10 border-[#D4D0C5] focus:border-[#1B3A6B]" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#1B3A6B]">Password Setup</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Min. 8 characters"
                        className="pl-10 border-[#D4D0C5] focus:border-[#1B3A6B]" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-[#5A6A7A] pt-2">
                    By submitting this request, you agree to the DPDPA 2023 compliance terms and data handling protocols.
                  </div>

                  <Button 
                    className="w-full bg-[#1B3A6B] hover:bg-[#2A4A7B] text-white mt-4 h-11" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Request...</>
                    ) : (
                      "Submit Access Request"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-[#F5F3EE] pt-6 pb-6">
                <p className="text-sm text-[#5A6A7A]">
                  Already have an account?{" "}
                  <Link href={`/login?role=${role}`} className="font-semibold text-[#1B3A6B] hover:underline">
                    Sign in
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
