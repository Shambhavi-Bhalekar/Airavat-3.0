"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Scale,
  Users,
  Building2,
  BarChart3,
  Globe,
  Lock,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react"

const features = [
  {
    icon: Scale,
    title: "Section 479 BNSS Eligibility Engine",
    description: "Automated eligibility assessment with confidence scoring and reasoning chains for every undertrial case.",
  },
  {
    icon: Users,
    title: "Paralegal Workstation",
    description: "Prioritized case queue, hearing preparation briefs, and family notification management.",
  },
  {
    icon: Building2,
    title: "Prison-Level Analytics",
    description: "District-wide monitoring with prison summaries, action queues, and NALSA report generation.",
  },
  {
    icon: BarChart3,
    title: "Systemic Pattern Intelligence",
    description: "Court behavior analysis, surety affordability mapping, and adjournment prediction.",
  },
  {
    icon: Globe,
    title: "Multilingual NLP",
    description: "FIR charge extraction in 10+ Indian languages with plain-language translations for families.",
  },
  {
    icon: Lock,
    title: "DPDPA 2023 Compliant",
    description: "Privacy by architecture with data localization, audit trails, and role-based access control.",
  },
]

const stats = [
  { value: "5,000+", label: "Undertrials Tracked" },
  { value: "847", label: "Active Cases" },
  { value: "187", label: "Currently Eligible" },
  { value: "18 days", label: "Avg Processing Time" },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      {/* Header */}
      <header className="border-b border-[#D4D0C5] bg-[#1B3A6B] sticky top-0 z-40">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#C9A84C]">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#1B3A6B]" />
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-white">JusticeGrid</span>
          </div>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm text-white/70 hover:text-white transition-colors">
              About
            </Link>
            <Link href="#compliance" className="text-sm text-white/70 hover:text-white transition-colors">
              Compliance
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#C9A84C] text-[#1B3A6B] hover:bg-[#D4B85C]">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1B3A6B] px-4 py-4 space-y-3">
            {["Features", "About", "Compliance"].map(item => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-white/70 hover:text-white py-1 transition-colors"
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-[#C9A84C] text-[#1B3A6B] hover:bg-[#D4B85C]">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="py-14 sm:py-20 md:py-32 bg-gradient-to-b from-[#1B3A6B] to-[#2A4A7B]">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C]/20 px-4 py-1.5 text-xs sm:text-sm text-[#C9A84C] mb-6 border border-[#C9A84C]/30">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            UTRC Framework Compliant
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto text-balance">
            AI-Powered Undertrial Rights Management for Indian DLSAs
          </h1>
          
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto text-pretty">
            Identify Section 479 BNSS eligible undertrials, surface actionable interventions, 
            and generate systemic intelligence - with full transparency and ethical safeguards.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link href="/login?role=paralegal" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 bg-[#C9A84C] text-[#1B3A6B] hover:bg-[#D4B85C]">
                <Users className="h-5 w-5" />
                Paralegal Workstation
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login?role=coordinator" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent">
                <BarChart3 className="h-5 w-5" />
                UTRC Coordinator Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold text-[#C9A84C]">{stat.value}</p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white border-y border-[#D4D0C5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B3A6B]">
              Decision Support, Not Decision Making
            </h2>
            <p className="mt-4 text-[#5A6A7A] max-w-2xl mx-auto">
              Every output is an input to human judgment. Full transparency with confidence scores, 
              reasoning chains, and uncertainty flags at every step.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-[#F5F3EE] border-[#D4D0C5] hover:border-[#C9A84C] transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1B3A6B] mb-4">
                    <feature.icon className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <CardTitle className="text-lg text-[#1B3A6B]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#5A6A7A]">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section id="about" className="py-20 bg-[#F5F3EE]">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1B3A6B]">
                Ethical Architecture by Design
              </h2>
              <p className="mt-4 text-[#5A6A7A]">
                JusticeGrid is built with fundamental constraints that protect undertrial rights 
                and ensure accountability at every layer.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Never gives legal advice or predicts outcomes",
                  "Never auto-merges identity records",
                  "Never applies the most favorable charge automatically",
                  "Every assessment shows confidence level and reasoning chain",
                  "All audit logs are immutable and reconstructible",
                  "Role-based access with no bulk access without audit trail",
                ].map((principle) => (
                  <div key={principle} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                    <span className="text-[#1B3A6B]">{principle}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-white border-[#C9A84C]/50 border-2">
              <CardHeader>
                <div className="flex items-center gap-2 text-[#B45309]">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-base">Graceful Degradation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-[#F5F3EE] border border-[#D4D0C5]">
                    <p className="font-medium text-[#1B3A6B]">eCourts API downtime</p>
                    <p className="text-[#5A6A7A] mt-1">
                      Mark cases as stale. Block auto-escalation. Surface staleness timestamp.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F5F3EE] border border-[#D4D0C5]">
                    <p className="font-medium text-[#1B3A6B]">FIR parsing below threshold</p>
                    <p className="text-[#5A6A7A] mt-1">
                      Flag for mandatory lawyer review. Never silently include in eligible queue.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F5F3EE] border border-[#D4D0C5]">
                    <p className="font-medium text-[#1B3A6B]">Life imprisonment detected</p>
                    <p className="text-[#5A6A7A] mt-1">
                      Route to lawyer review. Remove from auto-eligible surface.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F5F3EE] border border-[#D4D0C5]">
                    <p className="font-medium text-[#1B3A6B]">Identity mismatch</p>
                    <p className="text-[#5A6A7A] mt-1">
                      Flag for human resolution. Never auto-merge.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="py-20 bg-white border-t border-[#D4D0C5]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1B3A6B]">
            DPDPA 2023 Compliant by Architecture
          </h2>
          <p className="mt-4 text-[#5A6A7A] max-w-2xl mx-auto">
            Privacy protections are structural - not policy promises. Data localization, 
            right to erasure, and deletion triggers are built into the system architecture.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card className="bg-[#F5F3EE] border-[#D4D0C5] text-left">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-[#1B3A6B] flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-semibold text-[#1B3A6B]">Data Localization</h3>
                <p className="text-sm text-[#5A6A7A] mt-2">
                  Local models train on district-level data. Only model weights shared centrally 
                  with differential privacy guarantees.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#F5F3EE] border-[#D4D0C5] text-left">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-[#1B3A6B] flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-semibold text-[#1B3A6B]">Immutable Audit Logs</h3>
                <p className="text-sm text-[#5A6A7A] mt-2">
                  Every assessment records data sources, timestamps, reasoning chain, confidence score, 
                  and paralegal response.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#F5F3EE] border-[#D4D0C5] text-left">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-[#1B3A6B] flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-semibold text-[#1B3A6B]">Role-Based Access</h3>
                <p className="text-sm text-[#5A6A7A] mt-2">
                  No single role has bulk access without audit trail. No bulk export without 
                  DLSA supervisor approval.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1B3A6B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Start Managing Undertrial Cases Today
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Access the paralegal workstation or UTRC coordinator dashboard to begin 
            identifying eligible undertrials in your district.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?role=paralegal">
              <Button size="lg" className="bg-[#C9A84C] text-[#1B3A6B] hover:bg-[#D4B85C]">
                Access Paralegal Workstation
              </Button>
            </Link>
            <Link href="/login?role=coordinator">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                UTRC Coordinator Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D4D0C5] py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3A6B]">
                <Shield className="h-4 w-4 text-[#C9A84C]" />
              </div>
              <span className="text-sm font-medium text-[#1B3A6B]">JusticeGrid</span>
            </div>
            
            <p className="text-sm text-[#5A6A7A] text-center">
              AI-powered decision support for District Legal Services Authorities under the UTRC framework.
            </p>

            <p className="text-sm text-[#5A6A7A]">
              DPDPA 2023 Compliant
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
