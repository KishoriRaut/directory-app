'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Professional } from '@/types/directory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, X, User, Briefcase, Mail, Phone, MapPin, Clock, FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from '@/components/ImageUpload'

const categories = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'maid', label: 'Maid & Cleaner' },
  { value: 'designer', label: 'Designer' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'other', label: 'Other' }
]

export default function AddProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    category: 'other' as Professional['category'],
    email: '',
    phone: '',
    location: '',
    experience: '',
    description: '',
    availability: '',
    services: [] as string[],
    newService: '',
    imageUrl: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/signin?redirect=/add-profile')
        return
      }
      setUser(session.user)

      // Pre-fill email from authenticated user
      if (session.user?.email) {
        setFormData(prev => ({ ...prev, email: session.user.email || '' }))
      }
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/signin?redirect=/add-profile')
      } else {
        setUser(session.user)
        if (session.user?.email) {
          setFormData(prev => ({ ...prev, email: session.user.email || '' }))
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.profession.trim()) newErrors.profession = 'Profession is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.experience || parseInt(formData.experience) < 0) {
      newErrors.experience = 'Valid experience is required'
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.availability.trim()) newErrors.availability = 'Availability is required'
    if (formData.services.length === 0) newErrors.services = 'At least one service is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Insert professional data
      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .insert({
          name: formData.name,
          profession: formData.profession,
          category: formData.category,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          experience: parseInt(formData.experience),
          rating: 0,
          description: formData.description,
          availability: formData.availability,
          image_url: formData.imageUrl || null,
          verified: false
        } as any)
        .select()
        .single() as { data: { id: string } | null; error: any }

      if (professionalError) {
        console.error('Error creating professional:', professionalError)
        alert('Error creating profile. Please try again.')
        return
      }

      // Insert services
      if (formData.services.length > 0 && professionalData) {
        const servicesToInsert = formData.services.map(service => ({
          professional_id: professionalData.id,
          service_name: service
        }))

        const { error: servicesError } = await supabase
          .from('services')
          .insert(servicesToInsert as any)

        if (servicesError) {
          console.error('Error adding services:', servicesError)
          alert('Profile created but there was an error adding services.')
        }
      }

      alert('Profile submitted successfully!')
      
      // Reset form
      setFormData({
        name: '',
        profession: '',
        category: 'other',
        email: '',
        phone: '',
        location: '',
        experience: '',
        description: '',
        availability: '',
        services: [],
        newService: '',
        imageUrl: ''
      })
      
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addService = () => {
    if (formData.newService.trim() && !formData.services.includes(formData.newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, prev.newService.trim()],
        newService: ''
      }))
    }
  }

  const removeService = (serviceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service !== serviceToRemove)
    }))
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageChange = (imageUrl: string | null) => {
    updateField('imageUrl', imageUrl || '')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Add Your Profile to Siscora Connect
              </h1>
              <p className="text-gray-600 mt-2">Join our community of trusted professionals</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Basic Information
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Tell us about yourself</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Profile Photo */}
                <div>
                  <Label className="text-sm font-medium text-gray-900">Profile Photo</Label>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Upload a professional photo to help clients recognize you</p>
                  <div className="mt-2">
                    <ImageUpload
                      currentImage={formData.imageUrl}
                      onImageChange={handleImageChange}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>

                {/* Name and Profession */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={`mt-2 h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="profession" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      Profession <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => updateField('profession', e.target.value)}
                      placeholder="e.g., Software Engineer, Plumber, Designer"
                      className={`mt-2 h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.profession ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.profession && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.profession}</p>}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                    <SelectTrigger className={`h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.category ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select your category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600 mt-1.5">{errors.category}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Contact Information
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">How clients can reach you</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className={`mt-2 h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="e.g., +1 (555) 123-4567"
                      className={`mt-2 h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="City, State"
                      className={`mt-2 h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.location && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.location}</p>}
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      Years of Experience <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => updateField('experience', e.target.value)}
                      placeholder="e.g., 5"
                      className={`mt-2 h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.experience ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.experience && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.experience}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Professional Details
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Describe your services and availability</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Professional Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your professional background, expertise, and what makes you stand out..."
                    rows={5}
                    className={`mt-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 resize-none ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Minimum 50 characters recommended</p>
                  {errors.description && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="availability" className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Availability <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => updateField('availability', e.target.value)}
                    placeholder="e.g., Mon-Fri: 9AM-5PM, Weekends: 10AM-2PM"
                    className={`mt-2 h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 ${errors.availability ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.availability && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.availability}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gray-500" />
                    Services Offered <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">Add at least one service you offer</p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={formData.newService}
                        onChange={(e) => updateField('newService', e.target.value)}
                        placeholder="e.g., Web Development, Plumbing Repair, Logo Design"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                        className="h-11 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <Button 
                        type="button" 
                        onClick={addService} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700 rounded-lg px-4"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {formData.services.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {formData.services.map((service) => (
                          <Badge key={service} variant="secondary" className="pr-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(service)}
                              className="ml-2 hover:text-red-600 transition-colors"
                              aria-label={`Remove ${service}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.services && <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">{errors.services}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
              <p className="text-sm text-gray-600">
                <span className="text-red-500">*</span> Required fields
              </p>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700 rounded-lg h-12 text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
