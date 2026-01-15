'use client'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TermsPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-3xl font-bold text-gray-900">Terms of Service</CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose-base max-w-none py-8">
              <div className="space-y-6 text-gray-700">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <p className="leading-relaxed">
                    By accessing and using Siscora Pro, you accept and agree to be bound by the terms and provision of this agreement. 
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
                  <p className="leading-relaxed mb-3">
                    Permission is granted to temporarily use Siscora Pro for personal, non-commercial transitory viewing only. 
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                  <p className="leading-relaxed mb-3">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                    You are responsible for safeguarding the password and for all activities that occur under your account.
                  </p>
                  <p className="leading-relaxed">
                    You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Professional Profiles</h2>
                  <p className="leading-relaxed mb-3">
                    Professionals who create profiles on Siscora Pro agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate and truthful information about their qualifications and services</li>
                    <li>Maintain the confidentiality of client information</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Not engage in fraudulent, deceptive, or misleading practices</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Uses</h2>
                  <p className="leading-relaxed mb-3">
                    You may not use Siscora Pro:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>In any way that violates any applicable law or regulation</li>
                    <li>To transmit any malicious code or viruses</li>
                    <li>To impersonate or attempt to impersonate another user or entity</li>
                    <li>To engage in any automated use of the system</li>
                    <li>To harass, abuse, or harm other users</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Content</h2>
                  <p className="leading-relaxed">
                    Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. 
                    You are responsible for the content that you post on or through the service, including its legality, reliability, and appropriateness.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer</h2>
                  <p className="leading-relaxed">
                    The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, 
                    Siscora Pro excludes all representations, warranties, and conditions relating to our website and the use of this website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                  <p className="leading-relaxed">
                    In no event shall Siscora Pro, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                    be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
                  <p className="leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                    If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                  <p className="leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us through our support channels.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
