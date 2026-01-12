'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  Briefcase, 
  Award, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  Clock, 
  Shield, 
  Camera, 
  Upload,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  Globe
} from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  id: string
  name: string
  profession: string
  category: string
  email: string
  phone: string
  location: string
  experience: number
  rating: number
  description: string
  services: string[]
  availability: string
  imageUrl?: string
  verified: boolean
  createdAt: string
  website?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  pricing?: {
    hourlyRate?: number
    serviceTypes?: string[]
  }
  stats?: {
    jobsCompleted: number
    repeatClients: number
    responseRate: number
    avgResponseTime: string
  }
  updated_at?: string
}

export default function MyProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ProfileData>>({})
  const [originalData, setOriginalData] = useState<Partial<ProfileData>>({})
  const [newService, setNewService] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/signin')
        return
      }
      setUser(session.user)
      fetchProfile(session.user.id)
    }

    checkAuth()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        setLoading(false)
        return
      }

      if (data) {
        setProfile(data as ProfileData)
        setFormData(data as ProfileData)
      } else {
        // Create default profile if none exists
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        const defaultProfile: Partial<ProfileData> = {
          id: userId,
          name: currentSession?.user?.user_metadata?.full_name || currentSession?.user?.email?.split('@')[0] || '',
          profession: '',
          category: 'other',
          email: currentSession?.user?.email || '',
          phone: '',
          location: '',
          experience: 0,
          rating: 0,
          description: '',
          services: [],
          availability: '',
          verified: false,
          createdAt: new Date().toISOString(),
          website: '',
          socialLinks: {},
          pricing: {
            hourlyRate: 0,
            serviceTypes: []
          },
          stats: {
            jobsCompleted: 0,
            repeatClients: 0,
            responseRate: 95,
            avgResponseTime: '2 hours'
          }
        }
        setProfile(defaultProfile as ProfileData)
        setFormData(defaultProfile)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSavingStatus('saving')
    
    try {
      // Validate form first
      if (!validateForm()) {
        setSavingStatus('error')
        setSaving(false)
        return
      }

      const profileData: any = {
        ...formData,
        id: user?.id,
        updated_at: new Date().toISOString()
      }

      // Use insert or update based on whether profile exists
      if (profile) {
        const { error } = await supabase
          .from('professionals')
          .update(profileData)
          .eq('id', user?.id)

        if (error) {
          console.error('Error updating profile:', error)
          setSavingStatus('error')
          setSaving(false)
          return
        }
      } else {
        const { error } = await supabase
          .from('professionals')
          .insert(profileData)

        if (error) {
          console.error('Error creating profile:', error)
          setSavingStatus('error')
          setSaving(false)
          return
        }
      }

      setProfile(formData as ProfileData)
      setOriginalData({ ...formData })
      setHasChanges(false)
      setEditing(false)
      setSavingStatus('success')
      
      // Show success message
      setTimeout(() => {
        setSavingStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setSavingStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Helper function to validate website URLs
const isValidWebsite = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
      return false
    }
  }
  
  // Validation functions

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    const requiredFields = ['name', 'profession', 'email']
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })

    // Optional fields
    const optionalFields = ['phone', 'experience', 'rating', 'description', 'website']
    optionalFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== '') {
        const error = validateField(field, formData[field])
        if (error) newErrors[field] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const startEditing = () => {
    setOriginalData({ ...formData })
    setErrors({})
    setHasChanges(false)
    setEditing(true)
    setSavingStatus('idle')
  }

  const cancelEditing = () => {
    setFormData({ ...originalData })
    setErrors({})
    setHasChanges(false)
    setEditing(false)
    setSavingStatus('idle')
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
    
    // Check if there are changes
    const hasFieldChanged = JSON.stringify(formData[field]) !== JSON.stringify(originalData[field])
    setHasChanges(hasFieldChanged || Object.keys(formData).some(key => 
      JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
    ))
  }

  const addService = () => {
    if (newService.trim() && formData.services) {
      setFormData({
        ...formData,
        services: [...formData.services, newService.trim()]
      })
      setNewService('')
    }
  }

  const removeService = (index: number) => {
    if (formData.services) {
      setFormData({
        ...formData,
        services: formData.services.filter((_, i) => i !== index)
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Please create your profile to get started.</p>
          <Link href="/add-profile">
            <Button>Create Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <Button variant="ghost" size="sm">
                ← Back to Directory
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    {/* Profile Image */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        {profile.imageUrl ? (
                          <img 
                            src={profile.imageUrl} 
                            alt={profile.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-white" />
                        )}
                      </div>
                      {editing && (
                        <div className="absolute -bottom-2 -right-2">
                          <ImageUpload
                            currentImage={profile.imageUrl}
                            onImageChange={(url) => setFormData({ ...formData, imageUrl: url || undefined })}
                            className="w-10 h-10"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Basic Info */}
                    <div className="flex-1">
                      {editing ? (
                        <div className="space-y-2">
                          <div>
                            <Input
                              value={formData.name || ''}
                              onChange={(e) => handleFieldChange('name', e.target.value)}
                              placeholder="Your name"
                              className={`text-xl font-semibold ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && (
                              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                          </div>
                          <div>
                            <Input
                              value={formData.profession || ''}
                              onChange={(e) => handleFieldChange('profession', e.target.value)}
                              placeholder="Your profession"
                              className={`text-gray-600 ${errors.profession ? 'border-red-500' : ''}`}
                            />
                            {errors.profession && (
                              <p className="text-red-500 text-sm mt-1">{errors.profession}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                          <p className="text-lg text-gray-600">{profile.profession}</p>
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{profile.rating || 'N/A'}</span>
                        </div>
                        {profile.verified && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Verified</span>
                          </div>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {profile.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <Button 
                          onClick={handleSave} 
                          disabled={saving || !hasChanges}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEditing}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={startEditing}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  
                  {/* Status Messages */}
                  {savingStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Profile saved successfully!
                    </div>
                  )}
                  {savingStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <X className="h-4 w-4" />
                      Failed to save profile. Please check your inputs.
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about yourself, your experience, and what makes you unique..."
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.description || 'No description provided yet.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        placeholder="Add a service..."
                        onKeyPress={(e) => e.key === 'Enter' && addService()}
                      />
                      <Button onClick={addService}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.services?.map((service, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {service}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeService(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.services?.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                    {(!profile.services || profile.services.length === 0) && (
                      <p className="text-gray-500">No services listed yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <Input
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        <Input
                          value={formData.availability || ''}
                          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                          placeholder="e.g., Mon-Fri: 9AM-5PM"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <Input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.availability && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span>{profile.availability}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall</span>
                    <span className="text-sm font-semibold">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Basic Info</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Contact Details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                      <span>Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                      <span>Portfolio</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Jobs Completed</span>
                  </div>
                  <span className="font-semibold">{profile.stats?.jobsCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Repeat Clients</span>
                  </div>
                  <span className="font-semibold">{profile.stats?.repeatClients || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Response Rate</span>
                  </div>
                  <span className="font-semibold">{profile.stats?.responseRate || 95}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Avg Response</span>
                  </div>
                  <span className="font-semibold">{profile.stats?.avgResponseTime || '2 hours'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Verified</span>
                  {profile.verified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Check</span>
                  {profile.verified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Shield className="h-4 w-4 mr-2" />
                  Get Verified
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
