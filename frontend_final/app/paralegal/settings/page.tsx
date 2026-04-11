"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  User,
  Bell,
  Globe,
  Shield,
  Database,
  Wifi,
  CheckCircle2,
  Key,
  LogOut,
  Download,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Sync", icon: Database },
]

export default function ParalegalSettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [saved, setSaved] = useState(false)
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
      <AppHeader
        title="Settings"
        subtitle="Configure your workspace and preferences"
        syncStatus="online"
        lastSync="5 min ago"
      />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex gap-6 flex-col md:flex-row">
            {/* Settings Nav */}
            <aside className="w-full md:w-56 shrink-0">
              <nav className="space-y-1">
                {settingsSections.map(section => {
                  const Icon = section.icon
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors",
                        isActive
                          ? "bg-[#1B3A6B] text-white"
                          : "text-[#5A6A7A] hover:bg-[#E8E5DC] hover:text-[#1B3A6B]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {section.label}
                      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </button>
                  )
                })}
              </nav>

              {/* User Info */}
              <div className="mt-6 rounded-xl border border-[#D4D0C5] bg-white p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C] text-[#1B3A6B] font-semibold">
                    PK
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B3A6B]">Priya Kumari</p>
                    <p className="text-xs text-[#5A6A7A]">Paralegal</p>
                  </div>
                </div>
                <p className="text-xs text-[#5A6A7A]">DLSA Lucknow, Uttar Pradesh</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#166534]" />
                  <span className="text-xs text-[#166534]">Online</span>
                </div>
              </div>
            </aside>

            {/* Settings Content */}
            <div className="flex-1 space-y-5">
              {/* Profile */}
              {activeSection === "profile" && (
                <Card className="bg-white border-[#D4D0C5]">
                  <CardHeader>
                    <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                      <User className="h-5 w-5 text-[#C9A84C]" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C] text-[#1B3A6B] text-xl font-bold">
                        PK
                      </div>
                      <Button variant="outline" size="sm" className="border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                        Change Photo
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Full Name</Label>
                        <Input defaultValue="Priya Kumari" className="border-[#D4D0C5] focus:border-[#1B3A6B]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Employee ID</Label>
                        <Input defaultValue="DLSA-LKO-P042" className="border-[#D4D0C5] focus:border-[#1B3A6B]" readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Email</Label>
                        <Input defaultValue="priya.kumari@dlsa.up.gov.in" className="border-[#D4D0C5] focus:border-[#1B3A6B]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Phone</Label>
                        <Input defaultValue="+91-9876543210" className="border-[#D4D0C5] focus:border-[#1B3A6B]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">District Legal Services Authority</Label>
                        <Select defaultValue="lucknow">
                          <SelectTrigger className="border-[#D4D0C5]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="lucknow">DLSA Lucknow</SelectItem>
                            <SelectItem value="varanasi">DLSA Varanasi</SelectItem>
                            <SelectItem value="agra">DLSA Agra</SelectItem>
                            <SelectItem value="kanpur">DLSA Kanpur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Role</Label>
                        <Input defaultValue="Paralegal" readOnly className="border-[#D4D0C5] bg-[#F5F3EE]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1B3A6B]">Assigned Prisons</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Central Jail, Lucknow", "Women Jail, Lucknow", "District Jail, Kanpur"].map(p => (
                          <span key={p} className="rounded-full bg-[#1B3A6B]/10 px-3 py-1 text-xs font-medium text-[#1B3A6B]">
                            {p}
                          </span>
                        ))}
                        <button className="rounded-full bg-[#E8E5DC] px-3 py-1 text-xs font-medium text-[#5A6A7A] hover:bg-[#D4D0C5]">
                          + Add
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications */}
              {activeSection === "notifications" && (
                <Card className="bg-white border-[#D4D0C5]">
                  <CardHeader>
                    <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                      <Bell className="h-5 w-5 text-[#C9A84C]" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-[#1B3A6B]">Alert Types</p>
                      {[
                        { label: "Eligibility window opening", desc: "Notify when a case becomes eligible under Section 479 BNSS", default: true, severity: "critical" },
                        { label: "Window closing soon", desc: "Alert when eligibility expires within 7 days", default: true, severity: "warning" },
                        { label: "Data staleness", desc: "Warn when case data is older than 48 hours", default: true, severity: "warning" },
                        { label: "Identity mismatch", desc: "Alert when data source discrepancies are detected", default: true, severity: "critical" },
                        { label: "Lawyer review required", desc: "Notify when a case requires lawyer intervention", default: false, severity: "info" },
                        { label: "Family notification status", desc: "Updates on family SMS delivery", default: false, severity: "info" },
                        { label: "Court pattern anomalies", desc: "When high adjournment rates are detected", default: false, severity: "info" },
                      ].map(item => (
                        <div key={item.label} className="flex items-start justify-between gap-4 py-2 border-b border-[#E8E5DC] last:border-0">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#1B3A6B]">{item.label}</p>
                              <span className={cn(
                                "rounded px-1.5 py-0.5 text-xs font-medium text-white",
                                item.severity === "critical" ? "bg-[#B91C1C]" :
                                item.severity === "warning" ? "bg-[#B45309]" : "bg-[#1B3A6B]"
                              )}>
                                {item.severity}
                              </span>
                            </div>
                            <p className="text-xs text-[#5A6A7A]">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                            <input type="checkbox" defaultChecked={item.default} className="peer sr-only" />
                            <div className="peer h-5 w-9 rounded-full bg-[#D4D0C5] peer-checked:bg-[#1B3A6B] transition-colors" />
                            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#1B3A6B]">Delivery Channels</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { label: "In-app Notifications", icon: Bell, enabled: true },
                          { label: "Email Alerts", icon: Globe, enabled: true },
                          { label: "SMS (registered number)", icon: Wifi, enabled: false },
                          { label: "WhatsApp", icon: Wifi, enabled: false },
                        ].map(ch => {
                          const Icon = ch.icon
                          return (
                            <div key={ch.label} className="flex items-center justify-between rounded-lg border border-[#D4D0C5] p-3">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-[#5A6A7A]" />
                                <span className="text-sm text-[#1B3A6B]">{ch.label}</span>
                              </div>
                              <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                                <input type="checkbox" defaultChecked={ch.enabled} className="peer sr-only" />
                                <div className="peer h-5 w-9 rounded-full bg-[#D4D0C5] peer-checked:bg-[#1B3A6B] transition-colors" />
                                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Language */}
              {activeSection === "language" && (
                <Card className="bg-white border-[#D4D0C5]">
                  <CardHeader>
                    <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                      <Globe className="h-5 w-5 text-[#C9A84C]" />
                      Language & Regional Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Interface Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger className="border-[#D4D0C5]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                            <SelectItem value="ur">اردو (Urdu)</SelectItem>
                            <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                            <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Date Format</Label>
                        <Select defaultValue="dd-mm-yyyy">
                          <SelectTrigger className="border-[#D4D0C5]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                            <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                            <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Time Zone</Label>
                        <Select defaultValue="ist">
                          <SelectTrigger className="border-[#D4D0C5]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Default Legal Act</Label>
                        <Select defaultValue="bnss">
                          <SelectTrigger className="border-[#D4D0C5]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="bnss">BNSS (New)</SelectItem>
                            <SelectItem value="ipc">IPC (Legacy)</SelectItem>
                            <SelectItem value="both">Show Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1B3A6B]">OCR Languages for FIR Processing</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Hindi", "English", "Urdu", "Marathi", "Bengali", "Telugu", "Tamil", "Bhojpuri"].map(lang => (
                          <label key={lang} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={["Hindi", "English", "Urdu"].includes(lang)}
                              className="h-4 w-4 accent-[#1B3A6B]"
                            />
                            <span className="text-sm text-[#5A6A7A]">{lang}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-[#5A6A7A]">Selected languages will be used for AI document processing and OCR extraction.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security */}
              {activeSection === "security" && (
                <div className="space-y-4">
                  <Card className="bg-white border-[#D4D0C5]">
                    <CardHeader>
                      <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                        <Key className="h-5 w-5 text-[#C9A84C]" />
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showCurrentPwd ? "text" : "password"}
                            placeholder="Enter current password"
                            className="border-[#D4D0C5] focus:border-[#1B3A6B] pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A7A] hover:text-[#1B3A6B]"
                          >
                            {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1B3A6B]">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNewPwd ? "text" : "password"}
                            placeholder="Enter new password (min. 8 characters)"
                            className="border-[#D4D0C5] focus:border-[#1B3A6B] pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPwd(!showNewPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A7A] hover:text-[#1B3A6B]"
                          >
                            {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button className="bg-[#1B3A6B] hover:bg-[#2A4A7B]">Update Password</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#D4D0C5]">
                    <CardHeader>
                      <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                        <Shield className="h-5 w-5 text-[#C9A84C]" />
                        Session & Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-[#E8E5DC]">
                        <div>
                          <p className="text-sm font-medium text-[#1B3A6B]">Auto-logout after inactivity</p>
                          <p className="text-xs text-[#5A6A7A]">Session expires after idle time</p>
                        </div>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-32 border-[#D4D0C5]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-[#1B3A6B]">Two-factor authentication</p>
                          <p className="text-xs text-[#5A6A7A]">Extra layer of security for login</p>
                        </div>
                        <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="peer h-5 w-9 rounded-full bg-[#D4D0C5] peer-checked:bg-[#1B3A6B] transition-colors" />
                          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                        </label>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" className="gap-2 border-[#B91C1C] text-[#B91C1C] hover:bg-[#B91C1C]/10">
                          <LogOut className="h-4 w-4" />
                          Sign out all active sessions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Data & Sync */}
              {activeSection === "data" && (
                <div className="space-y-4">
                  <Card className="bg-white border-[#D4D0C5]">
                    <CardHeader>
                      <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                        <Wifi className="h-5 w-5 text-[#C9A84C]" />
                        Sync Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: "eCourts Portal", status: "connected", lastSync: "2 min ago" },
                        { label: "NJDG", status: "connected", lastSync: "5 min ago" },
                        { label: "UP Prison Records", status: "connected", lastSync: "8 min ago" },
                        { label: "Police Records API", status: "error", lastSync: "2 hours ago" },
                      ].map(src => (
                        <div key={src.label} className="flex items-center justify-between py-2.5 border-b border-[#E8E5DC] last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              src.status === "connected" ? "bg-[#166534]" : "bg-[#B91C1C]"
                            )} />
                            <div>
                              <p className="text-sm font-medium text-[#1B3A6B]">{src.label}</p>
                              <p className="text-xs text-[#5A6A7A]">Last synced: {src.lastSync}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs text-[#1B3A6B] hover:bg-[#E8E5DC]">
                            {src.status === "error" ? "Retry" : "Sync Now"}
                          </Button>
                        </div>
                      ))}
                      <div className="pt-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[#1B3A6B]">Auto-sync frequency</Label>
                          <Select defaultValue="5">
                            <SelectTrigger className="border-[#D4D0C5]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="1">Every 1 minute</SelectItem>
                              <SelectItem value="5">Every 5 minutes</SelectItem>
                              <SelectItem value="15">Every 15 minutes</SelectItem>
                              <SelectItem value="30">Every 30 minutes</SelectItem>
                              <SelectItem value="manual">Manual only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#D4D0C5]">
                    <CardHeader>
                      <CardTitle className="text-[#1B3A6B] flex items-center gap-2 text-base">
                        <Database className="h-5 w-5 text-[#C9A84C]" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start gap-3 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                        <Download className="h-4 w-4 text-[#C9A84C]" />
                        Export My Case Activity Log (CSV)
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-3 border-[#D4D0C5] text-[#1B3A6B] hover:bg-[#E8E5DC]">
                        <Download className="h-4 w-4 text-[#C9A84C]" />
                        Download Offline Dataset
                      </Button>
                      <div className="rounded-lg border border-[#B91C1C]/30 bg-[#B91C1C]/5 p-3">
                        <p className="text-xs text-[#B91C1C] mb-2 font-medium">Danger Zone</p>
                        <Button variant="outline" size="sm" className="gap-2 border-[#B91C1C] text-[#B91C1C] hover:bg-[#B91C1C]/10">
                          <Trash2 className="h-3.5 w-3.5" />
                          Clear Local Cache
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button className="bg-[#1B3A6B] hover:bg-[#2A4A7B] gap-2" onClick={handleSave}>
                  {saved ? (
                    <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                  ) : (
                    <><Settings className="h-4 w-4" /> Save Changes</>
                  )}
                </Button>
                <Button variant="ghost" className="text-[#5A6A7A] hover:bg-[#E8E5DC]">
                  Reset to defaults
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
