"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FilePlus,
  User,
  FileText,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Scale,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Case Details", icon: FileText },
  { id: 3, title: "Charges", icon: Scale },
  { id: 4, title: "Location", icon: MapPin },
  { id: 5, title: "Review", icon: CheckCircle2 },
]

const indianStates = [
  "Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Madhya Pradesh",
  "Rajasthan", "Tamil Nadu", "Karnataka", "Gujarat", "Odisha",
  "Telangana", "Kerala", "Jharkhand", "Assam", "Punjab",
  "Chhattisgarh", "Haryana", "Delhi", "Uttarakhand", "Himachal Pradesh",
]

const ipcSections = [
  { section: "302", description: "Murder" },
  { section: "307", description: "Attempt to murder" },
  { section: "376", description: "Rape" },
  { section: "379", description: "Theft" },
  { section: "380", description: "Theft in dwelling house" },
  { section: "392", description: "Robbery" },
  { section: "395", description: "Dacoity" },
  { section: "420", description: "Cheating" },
  { section: "467", description: "Forgery of valuable security" },
  { section: "468", description: "Forgery for cheating" },
  { section: "498A", description: "Cruelty by husband or relatives" },
  { section: "304B", description: "Dowry death" },
  { section: "323", description: "Voluntarily causing hurt" },
  { section: "324", description: "Causing grievous hurt" },
  { section: "506", description: "Criminal intimidation" },
]

interface Charge {
  act: string
  section: string
  description: string
  maxSentence: string
  isLifeImprisonment: boolean
}

interface FormData {
  prisonerName: string
  fatherName: string
  age: string
  gender: string
  prisonerId: string
  isFirstTimeOffender: string
  
  firNumber: string
  firDate: string
  policeStation: string
  arrestDate: string
  caseNumber: string
  
  charges: Charge[]
  
  prison: string
  district: string
  state: string
  
  familyPhone: string
  familyLanguage: string
  familyNotificationOptIn: boolean
  paralegalNotes: string
}

export default function NewCaseEntryPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    prisonerName: "",
    fatherName: "",
    age: "",
    gender: "",
    prisonerId: "",
    isFirstTimeOffender: "",
    firNumber: "",
    firDate: "",
    policeStation: "",
    arrestDate: "",
    caseNumber: "",
    charges: [{ act: "IPC", section: "", description: "", maxSentence: "", isLifeImprisonment: false }],
    prison: "",
    district: "",
    state: "",
    familyPhone: "",
    familyLanguage: "Hindi",
    familyNotificationOptIn: false,
    paralegalNotes: "",
  })

  const updateFormData = (field: keyof FormData, value: string | boolean | Charge[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCharge = () => {
    setFormData(prev => ({
      ...prev,
      charges: [...prev.charges, { act: "IPC", section: "", description: "", maxSentence: "", isLifeImprisonment: false }]
    }))
  }

  const removeCharge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      charges: prev.charges.filter((_, i) => i !== index)
    }))
  }

  const updateCharge = (index: number, field: keyof Charge, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      charges: prev.charges.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }))
  }

  const handleSectionSelect = (index: number, section: string) => {
    const found = ipcSections.find(s => s.section === section)
    if (found) {
      const newCharges = [...formData.charges]
      newCharges[index] = { ...newCharges[index], section: found.section, description: found.description }
      setFormData(prev => ({ ...prev, charges: newCharges }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
        <AppHeader title="New Case Entry" subtitle="Register a new undertrial case" syncStatus="online" lastSync="Just now" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-white border-[#D4D0C5] text-center">
            <CardContent className="pt-10 pb-8 space-y-4">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#166534]/10">
                  <CheckCircle2 className="h-10 w-10 text-[#166534]" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#1B3A6B]">Case Registered Successfully</h2>
              <p className="text-sm text-[#5A6A7A]">The case has been entered into the system. AI eligibility assessment will begin shortly.</p>
              <div className="rounded-lg bg-[#F5F3EE] border border-[#D4D0C5] px-4 py-3">
                <p className="text-xs text-[#5A6A7A]">Case ID</p>
                <p className="text-base font-mono font-semibold text-[#1B3A6B]">CASE-{Math.floor(Math.random() * 9000) + 1000}</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button className="bg-[#1B3A6B] hover:bg-[#2A4A7B]" onClick={() => setSubmitted(false)}>
                  Add Another Case
                </Button>
                <Button variant="outline" className="border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                  View Case Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="New Case Entry"
        subtitle="Register a new undertrial case for eligibility assessment"
        syncStatus="online"
        lastSync="2 min ago"
      />

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors text-sm font-medium",
                    isCompleted ? "bg-[#166534] border-[#166534] text-white" :
                    isActive ? "bg-[#1B3A6B] border-[#1B3A6B] text-white" :
                    "bg-white border-[#D4D0C5] text-[#5A6A7A]"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block",
                    isActive ? "text-[#1B3A6B]" : isCompleted ? "text-[#166534]" : "text-[#5A6A7A]"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    isCompleted ? "bg-[#166534]" : "bg-[#D4D0C5]"
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <Card className="bg-white border-[#D4D0C5]">
            <CardHeader>
              <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-[#C9A84C]" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Full Name (as in FIR) *</Label>
                  <Input
                    placeholder="e.g. Ramesh Kumar Singh"
                    value={formData.prisonerName}
                    onChange={e => updateFormData("prisonerName", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Father's / Husband's Name *</Label>
                  <Input
                    placeholder="e.g. Shyam Kumar Singh"
                    value={formData.fatherName}
                    onChange={e => updateFormData("fatherName", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Age *</Label>
                  <Input
                    type="number"
                    placeholder="Age in years"
                    value={formData.age}
                    onChange={e => updateFormData("age", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Gender *</Label>
                  <Select value={formData.gender} onValueChange={v => updateFormData("gender", v)}>
                    <SelectTrigger className="border-[#D4D0C5]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other / Transgender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Prison ID / Roll Number</Label>
                  <Input
                    placeholder="e.g. PRN-2024-5678"
                    value={formData.prisonerId}
                    onChange={e => updateFormData("prisonerId", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">First-time Offender? *</Label>
                  <Select value={formData.isFirstTimeOffender} onValueChange={v => updateFormData("isFirstTimeOffender", v)}>
                    <SelectTrigger className="border-[#D4D0C5]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="yes">Yes – No prior convictions</SelectItem>
                      <SelectItem value="no">No – Has prior conviction(s)</SelectItem>
                      <SelectItem value="unknown">Unknown – Needs verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-2 rounded-lg bg-[#F5F3EE] border border-[#D4D0C5] p-3">
                <p className="text-xs text-[#5A6A7A] flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-[#B45309] shrink-0" />
                  First-time offender status affects eligibility threshold: 1/3rd of max sentence for first-time vs 1/2 for repeat offenders under Section 479 BNSS.
                </p>
              </div>

              <div className="border-t border-[#D4D0C5] pt-4">
                <p className="text-sm font-medium text-[#1B3A6B] mb-3">Family Notification (Optional)</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm text-[#5A6A7A]">Family Contact Number</Label>
                    <Input
                      placeholder="+91-XXXXXXXXXX"
                      value={formData.familyPhone}
                      onChange={e => updateFormData("familyPhone", e.target.value)}
                      className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-[#5A6A7A]">Preferred Language</Label>
                    <Select value={formData.familyLanguage} onValueChange={v => updateFormData("familyLanguage", v)}>
                      <SelectTrigger className="border-[#D4D0C5]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Urdu">Urdu</SelectItem>
                        <SelectItem value="Bhojpuri">Bhojpuri</SelectItem>
                        <SelectItem value="Awadhi">Awadhi</SelectItem>
                        <SelectItem value="Marathi">Marathi</SelectItem>
                        <SelectItem value="Bengali">Bengali</SelectItem>
                        <SelectItem value="Telugu">Telugu</SelectItem>
                        <SelectItem value="Tamil">Tamil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Case Details */}
        {currentStep === 2 && (
          <Card className="bg-white border-[#D4D0C5]">
            <CardHeader>
              <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-[#C9A84C]" />
                Case & FIR Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">FIR Number *</Label>
                  <Input
                    placeholder="e.g. FIR/2024/456"
                    value={formData.firNumber}
                    onChange={e => updateFormData("firNumber", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">FIR Date *</Label>
                  <Input
                    type="date"
                    value={formData.firDate}
                    onChange={e => updateFormData("firDate", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Police Station *</Label>
                  <Input
                    placeholder="e.g. Hazratganj PS"
                    value={formData.policeStation}
                    onChange={e => updateFormData("policeStation", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Date of Arrest *</Label>
                  <Input
                    type="date"
                    value={formData.arrestDate}
                    onChange={e => updateFormData("arrestDate", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Court Case Number (if known)</Label>
                  <Input
                    placeholder="e.g. SC/2024/1234"
                    value={formData.caseNumber}
                    onChange={e => updateFormData("caseNumber", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1B3A6B]">Paralegal Notes</Label>
                <Textarea
                  placeholder="Any observations, documents available, prior actions taken..."
                  value={formData.paralegalNotes}
                  onChange={e => updateFormData("paralegalNotes", e.target.value)}
                  className="border-[#D4D0C5] focus:border-[#1B3A6B] min-h-[100px]"
                />
              </div>

              <div className="rounded-lg bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 p-3">
                <p className="text-xs text-[#1B3A6B] flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  The date of arrest is critical for calculating detention duration and eligibility under Section 479 BNSS. Verify against prison records.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Charges */}
        {currentStep === 3 && (
          <Card className="bg-white border-[#D4D0C5]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                  <Scale className="h-5 w-5 text-[#C9A84C]" />
                  Charges
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]"
                  onClick={addCharge}
                >
                  <Plus className="h-3 w-3" />
                  Add Charge
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.charges.map((charge, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border p-4 space-y-3",
                    charge.isLifeImprisonment ? "border-[#B91C1C]/30 bg-[#B91C1C]/5" : "border-[#D4D0C5] bg-[#F5F3EE]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1B3A6B]">Charge {index + 1}</span>
                    {formData.charges.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[#B91C1C] hover:bg-[#B91C1C]/10"
                        onClick={() => removeCharge(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#5A6A7A]">Act</Label>
                      <Select value={charge.act} onValueChange={v => updateCharge(index, "act", v)}>
                        <SelectTrigger className="border-[#D4D0C5] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="IPC">IPC</SelectItem>
                          <SelectItem value="BNSS">BNSS</SelectItem>
                          <SelectItem value="NDPS">NDPS</SelectItem>
                          <SelectItem value="POCSO">POCSO</SelectItem>
                          <SelectItem value="Arms Act">Arms Act</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#5A6A7A]">Section</Label>
                      <Select value={charge.section} onValueChange={v => handleSectionSelect(index, v)}>
                        <SelectTrigger className="border-[#D4D0C5] bg-white">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ipcSections.map(s => (
                            <SelectItem key={s.section} value={s.section}>
                              {s.section} – {s.description}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other (enter manually)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#5A6A7A]">Max Sentence</Label>
                      <Select value={charge.maxSentence} onValueChange={v => updateCharge(index, "maxSentence", v)}>
                        <SelectTrigger className="border-[#D4D0C5] bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="1 year">1 Year</SelectItem>
                          <SelectItem value="2 years">2 Years</SelectItem>
                          <SelectItem value="3 years">3 Years</SelectItem>
                          <SelectItem value="5 years">5 Years</SelectItem>
                          <SelectItem value="7 years">7 Years</SelectItem>
                          <SelectItem value="10 years">10 Years</SelectItem>
                          <SelectItem value="14 years">14 Years</SelectItem>
                          <SelectItem value="life">Life Imprisonment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#5A6A7A]">Description</Label>
                    <Input
                      placeholder="Short description of offence"
                      value={charge.description}
                      onChange={e => updateCharge(index, "description", e.target.value)}
                      className="border-[#D4D0C5] bg-white focus:border-[#1B3A6B]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`life-${index}`}
                      checked={charge.isLifeImprisonment}
                      onChange={e => updateCharge(index, "isLifeImprisonment", e.target.checked)}
                      className="h-4 w-4 accent-[#B91C1C]"
                    />
                    <label htmlFor={`life-${index}`} className="text-xs text-[#B91C1C] font-medium">
                      Life imprisonment / Death penalty charge (triggers mandatory lawyer review)
                    </label>
                  </div>
                </div>
              ))}

              <div className="rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 p-3">
                <p className="text-xs text-[#1B3A6B] flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-[#C9A84C] shrink-0" />
                  Charges determine eligibility under Section 479 BNSS. The AI will use OCR to verify against FIR documents. Enter the most serious charge first.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Location */}
        {currentStep === 4 && (
          <Card className="bg-white border-[#D4D0C5]">
            <CardHeader>
              <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-[#C9A84C]" />
                Prison & Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">State *</Label>
                  <Select value={formData.state} onValueChange={v => updateFormData("state", v)}>
                    <SelectTrigger className="border-[#D4D0C5]">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60">
                      {indianStates.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">District *</Label>
                  <Input
                    placeholder="e.g. Lucknow"
                    value={formData.district}
                    onChange={e => updateFormData("district", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-[#1B3A6B]">Prison Name *</Label>
                  <Input
                    placeholder="e.g. Central Jail, Lucknow"
                    value={formData.prison}
                    onChange={e => updateFormData("prison", e.target.value)}
                    className="border-[#D4D0C5] focus:border-[#1B3A6B]"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-[#F5F3EE] border border-[#D4D0C5] p-4 space-y-3">
                <p className="text-sm font-medium text-[#1B3A6B]">Data Sources Available</p>
                <div className="grid gap-2 md:grid-cols-3">
                  {["eCourts Portal", "NJDG", "Prison Records", "Police Records", "Criminal History DB"].map(src => (
                    <label key={src} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1B3A6B]" />
                      <span className="text-xs text-[#5A6A7A]">{src}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <Card className="bg-white border-[#D4D0C5]">
              <CardHeader>
                <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C]" />
                  Review & Submit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5A6A7A]">Personal Info</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">Name</span>
                        <span className="text-[#1B3A6B] font-medium">{formData.prisonerName || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">Father's Name</span>
                        <span className="text-[#1B3A6B] font-medium">{formData.fatherName || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">Age / Gender</span>
                        <span className="text-[#1B3A6B] font-medium">{formData.age || "—"} / {formData.gender || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">Offender Status</span>
                        <span className={cn(
                          "font-medium text-sm",
                          formData.isFirstTimeOffender === "yes" ? "text-[#166534]" : "text-[#B45309]"
                        )}>
                          {formData.isFirstTimeOffender === "yes" ? "First-time" : formData.isFirstTimeOffender === "no" ? "Repeat" : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5A6A7A]">Case Details</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">FIR Number</span>
                        <span className="text-[#1B3A6B] font-medium font-mono">{formData.firNumber || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">Arrest Date</span>
                        <span className="text-[#1B3A6B] font-medium">{formData.arrestDate || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">Police Station</span>
                        <span className="text-[#1B3A6B] font-medium">{formData.policeStation || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5A6A7A]">Prison</span>
                        <span className="text-[#1B3A6B] font-medium">{formData.prison ? `${formData.prison}, ${formData.district}` : "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#D4D0C5] pt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5A6A7A]">Charges ({formData.charges.length})</p>
                  {formData.charges.map((c, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between rounded-lg p-2.5 text-sm",
                      c.isLifeImprisonment ? "bg-[#B91C1C]/10" : "bg-[#F5F3EE]"
                    )}>
                      <span className="font-medium text-[#1B3A6B]">{c.act} § {c.section} – {c.description || "—"}</span>
                      {c.isLifeImprisonment && (
                        <span className="rounded bg-[#B91C1C] px-1.5 py-0.5 text-xs text-white">Life</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 p-3">
                  <p className="text-xs text-[#1B3A6B]">
                    <span className="font-semibold">AI Assessment:</span> Upon submission, the system will begin eligibility computation using Section 479 BNSS parameters. Results typically available within 2 minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            className="gap-2 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]"
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              className="gap-2 bg-[#1B3A6B] hover:bg-[#2A4A7B]"
              onClick={() => setCurrentStep(s => Math.min(steps.length, s + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="gap-2 bg-[#166534] hover:bg-[#14532D]"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FilePlus className="h-4 w-4" />
                  Submit Case
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
