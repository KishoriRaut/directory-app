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
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from '@/components/ImageUpload'

const categories = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'other', label: 'Other' }
]

export default function AddProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    category: 'doctor' as Professional['category'],
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
        .single()

      if (professionalError) {
        console.error('Error creating professional:', professionalError)
        alert('Error creating profile. Please try again.')
        return
      }

      // Insert services
      if (formData.services.length > 0) {
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
        category: 'doctor',
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

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border border-gray-200 rounded-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Profile Photo</Label>
                  <div className="mt-2">
                    <ImageUpload
                      currentImage={formData.imageUrl}
                      onImageChange={handleImageChange}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="profession" className="text-sm font-medium text-gray-700">Profession *</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => updateField('profession', e.target.value)}
                      placeholder="e.g., Cardiologist, Software Engineer"
                      className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.profession ? 'border-red-500' : ''}`}
                    />
                    {errors.profession && <p className="text-sm text-red-500 mt-1">{errors.profession}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat.value}
                        variant={formData.category === cat.value ? "default" : "outline"}
                        className={`cursor-pointer rounded-sm ${
                          formData.category === cat.value 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => updateField('category', cat.value)}
                      >
                        {cat.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="City, State"
                      className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.location ? 'border-red-500' : ''}`}
                    />
                    {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Years of Experience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => updateField('experience', e.target.value)}
                      className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.experience ? 'border-red-500' : ''}`}
                    />
                    {errors.experience && <p className="text-sm text-red-500 mt-1">{errors.experience}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your professional background and expertise..."
                    rows={4}
                    className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="availability" className="text-sm font-medium text-gray-700">Availability *</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => updateField('availability', e.target.value)}
                    placeholder="e.g., Mon-Fri: 9AM-5PM"
                    className={`mt-1 border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500 ${errors.availability ? 'border-red-500' : ''}`}
                  />
                  {errors.availability && <p className="text-sm text-red-500 mt-1">{errors.availability}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Services *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={formData.newService}
                        onChange={(e) => updateField('newService', e.target.value)}
                        placeholder="Add a service you offer"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                        className="border-gray-300 rounded-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button type="button" onClick={addService} className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 rounded-sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service) => (
                        <Badge key={service} variant="secondary" className="pr-1 bg-gray-50 border-gray-200 text-gray-700">
                          {service}
                          <button
                            type="button"
                            onClick={() => removeService(service)}
                            className="ml-2 hover:text-red-500"
                            aria-label={`Remove ${service}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {errors.services && <p className="text-sm text-red-500 mt-1">{errors.services}</p>}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 rounded-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
