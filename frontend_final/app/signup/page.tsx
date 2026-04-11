"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Mail, Lock, User, MapPin, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BASE_URL } from "@/lib/api"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "coordinator" ? "coordinator" : "paralegal"
  
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(defaultRole)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fullName, setFullName] = useState("")
  const [district, setDistrict] = useState("lucknow")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          district,
          role,
          email,
          password,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.detail ?? `Signup failed (${response.status})`)
      }

      setIsSuccess(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit request")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
        <Card className="max-w-md w-full border-[#D4D0C5] shadow-lg bg-white p-8 text-center space-y-6 flex flex-col items-center">
          <div className="h-16 w-16 bg-[#166534]/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-[#166534]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-navy">Request Submitted</h2>
            <p className="text-[#5A6A7A]">
              Your access request for {role === "paralegal" ? "Paralegal" : "UTRC Coordinator"} has been submitted for verification. 
              You will receive an email once your account is approved by the State Legal Services Authority.
            </p>
          </div>
          <Button 
            className="w-full bg-navy text-white hover:bg-navy-light"
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
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6A7A] transition-colors hover:text-navy">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy shadow-lg">
              <Shield className="h-7 w-7 text-gold" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">Request Access</h1>
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
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-navy">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="border-[#D4D0C5] pl-10 focus:border-navy"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-navy">Assigned District</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A] z-10" />
                      <Select value={district} onValueChange={setDistrict}>
                        <SelectTrigger className="border-[#D4D0C5] pl-10 focus:border-navy">
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
                    <Label htmlFor="email" className="text-navy">
                      {role === "paralegal" ? "Email or Employee ID" : "Official Govt. Email"}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="email" 
                        type={role === "coordinator" ? "email" : "text"}
                        placeholder={role === "paralegal" ? "DLSA ID or Email" : "coordinator@slsa.up.gov.in"} 
                        className="border-[#D4D0C5] pl-10 focus:border-navy"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-navy">Password Setup</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A7A]" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Min. 8 characters"
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
                  
                  <div className="text-xs text-[#5A6A7A] pt-2">
                    By submitting this request, you agree to the DPDPA 2023 compliance terms and data handling protocols.
                  </div>

                  <Button 
                    className="mt-4 h-11 w-full bg-navy text-white hover:bg-navy-light"
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
                  <Link href={`/login?role=${role}`} className="font-semibold text-navy hover:underline">
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
