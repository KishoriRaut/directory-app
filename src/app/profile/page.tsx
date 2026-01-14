'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { validateField as validateFieldUtil, validateForm as validateFormUtil } from '@/lib/validation'
import { VALIDATION_RULES } from '@/lib/constants'

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
  is_visible?: boolean // Controls profile visibility in search results
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

type UpdateData = Omit<ProfileData, 'id' | 'createdAt' | 'rating' | 'verified' | 'stats'>

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
  const [isOnboarding, setIsOnboarding] = useState(false)

  useEffect(() => {
    // Check for onboarding parameter from URL
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('onboarding') === 'true') {
        setIsOnboarding(true)
      }
    }

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          // Handle refresh token errors
          if (error.message?.includes('Refresh Token') || error.message?.includes('refresh_token')) {
            await supabase.auth.signOut()
            router.push('/auth/signin')
            return
          }
        }
        if (!session) {
          router.push('/auth/signin')
          return
        }
        setUser(session.user)
        if (session.user.email) {
          // Normalize email before fetching
          const normalizedEmail = session.user.email.toLowerCase().trim()
          fetchProfile(normalizedEmail)
        }
      } catch (error: any) {
        // Handle any unexpected errors
        if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token')) {
          await supabase.auth.signOut()
        }
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  // Keep formData in sync with profile when not editing (industry best practice)
  useEffect(() => {
    if (profile && !editing) {
      // Ensure imageUrl is properly mapped from profile
      const imageUrlToUse = profile.imageUrl || (profile as any).image_url || undefined
      const syncedFormData = {
        ...profile,
        imageUrl: imageUrlToUse
      }
      // Reduced logging - only log when there's a change or issue
      if (profile.imageUrl !== syncedFormData.imageUrl) {
        console.log('Syncing formData with profile - imageUrl updated')
      }
      setFormData(syncedFormData)
    }
  }, [profile, editing])

  // Initialize formData for create mode when no profile exists
  useEffect(() => {
    if (!profile && !loading && user?.email && !editing) {
      const initializeCreateMode = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          const initialData: Partial<ProfileData> = {
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            profession: '',
            category: 'other',
            email: session.user.email,
            phone: '',
            location: '',
            experience: 0,
            description: '',
            services: [],
            availability: '',
            website: ''
          }
          setFormData(initialData)
          setOriginalData(initialData)
        }
      }
      initializeCreateMode()
    }
  }, [profile, loading, user, editing])

  const fetchProfile = async (userEmail: string) => {
    try {
      const normalizedEmail = userEmail.toLowerCase().trim()
      console.log('Fetching profile for email:', normalizedEmail)
      
      // Try exact match first (most efficient) - explicitly select all fields including image_url
      let { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          services (
            service_name
          )
        `)
        .eq('email', normalizedEmail)
        .maybeSingle()
        
      console.log('Initial fetch result:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        hasImage_url: data ? !!(data as any).image_url : false,
        image_url_value: data ? (data as any).image_url : null,
        fullData: data
      })

      // If exact match fails, try case-insensitive search using ilike (industry best practice)
      if (!data && (error?.code === 'PGRST116' || !error)) {
        console.log('Trying case-insensitive search...')
        const { data: ilikeData, error: ilikeError } = await supabase
          .from('professionals')
          .select(`
            *,
            services (
              service_name
            )
          `)
          .ilike('email', normalizedEmail) // Case-insensitive LIKE (PostgreSQL)
          .maybeSingle()
        
        if (ilikeData) {
          data = ilikeData
          error = null
          console.log('Profile found via case-insensitive search')
          
          // Normalize the email in database for future queries (optional optimization)
          // This ensures future queries will work with exact match
          if (ilikeData.email !== normalizedEmail) {
            console.log('Normalizing email in database for future queries...')
            await supabase
              .from('professionals')
              .update({ email: normalizedEmail })
              .eq('id', ilikeData.id)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.warn('Could not normalize email:', updateError)
                } else {
                  console.log('Email normalized successfully')
                }
              })
          }
        } else if (!ilikeError || ilikeError.code === 'PGRST116') {
          // Last resort: client-side case-insensitive search (only if needed)
          console.log('Trying client-side case-insensitive search as last resort...')
          const { data: allProfiles, error: allError } = await supabase
            .from('professionals')
            .select(`
              *,
              services (
                service_name
              )
            `)
            .limit(1000) // Safety limit
          
          if (!allError && allProfiles) {
            const matchingProfile = allProfiles.find(
              (p: any) => p.email?.toLowerCase().trim() === normalizedEmail
            )
            if (matchingProfile) {
              console.log('Profile found via client-side search')
              data = matchingProfile
              error = null
              
              // Normalize email in database
              await supabase
                .from('professionals')
                .update({ email: normalizedEmail })
                .eq('id', matchingProfile.id)
            }
          }
        }
      }

      console.log('Profile fetch result:', { data: data ? 'Found' : 'Not found', error })

      if (error) {
        // Handle 406 and other errors gracefully
        if (error.code === 'PGRST116') {
          // PGRST116 means no rows found - this is expected when profile doesn't exist
          console.log('No profile found (PGRST116) for email:', normalizedEmail)
          setProfile(null)
        } else if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
          // 406 error - treat as no profile
          console.log('406 error - treating as no profile for email:', normalizedEmail)
          setProfile(null)
        } else {
          // Other errors - log but don't fail completely
          console.error('Error fetching profile:', error)
          // Still set profile to null to allow create mode
          setProfile(null)
        }
        setLoading(false)
        return
      }

      if (data) {
        console.log('Profile found successfully:', { id: data.id, name: data.name, email: data.email })
        
        // CRITICAL: Map database fields to TypeScript interface (image_url -> imageUrl, services array)
        // The database has 'image_url' (snake_case), we need 'imageUrl' (camelCase) for the interface
        const imageUrl = (data as any).image_url || (data as any).imageUrl || undefined
        
        console.log('Mapping image_url from database to imageUrl:', {
          database_image_url: (data as any).image_url,
          database_imageUrl: (data as any).imageUrl,
          mapped_imageUrl: imageUrl,
          imageUrlType: typeof imageUrl,
          imageUrlLength: imageUrl?.length
        })
        
        // Handle services - could be array or related table data
        let servicesArray: string[] = []
        if (Array.isArray((data as any).services)) {
          // Check if services is array of objects (from join query) or strings
          const firstItem = (data as any).services[0]
          if (firstItem && typeof firstItem === 'object' && firstItem.service_name) {
            // Array of objects with service_name property (from join query)
            servicesArray = (data as any).services.map((s: any) => s.service_name || s.name || String(s)).filter(Boolean)
          } else {
            // Array of strings
            servicesArray = (data as any).services.filter((s: any) => s != null && s !== '')
          }
        } else if ((data as any).services) {
          // If it's a single service or other format
          const singleService = (data as any).services
          if (typeof singleService === 'object' && singleService.service_name) {
            servicesArray = [singleService.service_name]
          } else {
            servicesArray = [String(singleService)].filter(Boolean)
          }
        }
        
        console.log('Raw profile data:', { 
          has_image_url: !!(data as any).image_url, 
          has_imageUrl: !!(data as any).imageUrl,
          image_url_value: (data as any).image_url,
          imageUrl_value: (data as any).imageUrl,
          services_type: typeof (data as any).services,
          services_is_array: Array.isArray((data as any).services),
          services_value: (data as any).services,
          allDataKeys: Object.keys(data || {}),
          fullData: data
        })
        
        // CRITICAL: If image_url is null but photo exists in bucket, we need to check storage
        if (!(data as any).image_url && data.id) {
          // Silently check if there's an orphaned image in storage for this user
          // This is a background check - don't spam console
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user?.id) {
            // Check if there are any images in storage for this user
            const { data: files } = await supabase.storage
              .from('my-photo')
              .list('profiles', {
                limit: 10,
                search: session.user.id
              })
            
            // If we find files but no image_url, log a helpful message
            if (files && files.length > 0 && files[0]) {
              // Found orphaned image - user can re-upload or we could auto-link it
              // For now, just note it exists but don't spam console
            }
          }
        }
        
        // Explicitly construct profileData to ensure imageUrl is set correctly
        // Use spread operator but override critical fields to ensure proper mapping
        const profileData: ProfileData = {
          ...data,
          // Explicitly override imageUrl to ensure it's set from image_url
          imageUrl: imageUrl || undefined,
          // Explicitly override services to ensure it's an array of strings
          services: servicesArray,
          // Map is_visible field (defaults to true if not set)
          is_visible: (data as any).is_visible !== undefined ? (data as any).is_visible : true,
          // Ensure date fields are properly mapped
          createdAt: (data as any).created_at || (data as any).createdAt || new Date().toISOString(),
          updated_at: (data as any).updated_at || (data as any).updated_at
        } as ProfileData
        
        // Final safety check: if imageUrl is still not set, try one more time
        if (!profileData.imageUrl && (data as any).image_url) {
          console.warn('ImageUrl still not set after mapping, forcing assignment')
          profileData.imageUrl = String((data as any).image_url)
        }
        
        // Check if this is a minimal profile (needs completion) - industry best practice
        const isMinimalProfile = !profileData.profession || !profileData.phone || !profileData.location || 
                                 !profileData.description || !profileData.availability || 
                                 (profileData.services && profileData.services.length === 0)
        
        console.log('Mapped profile data:', { 
          imageUrl: profileData.imageUrl,
          hasImage: !!profileData.imageUrl,
          imageUrlType: typeof profileData.imageUrl,
          imageUrlLength: profileData.imageUrl?.length,
          rawImageUrl: imageUrl,
          rawDataImage_url: (data as any).image_url,
          profileDataKeys: Object.keys(profileData),
          fullProfileData: profileData
        })
        
        // Double-check: Ensure imageUrl is set correctly (industry best practice - explicit mapping)
        if (!profileData.imageUrl && (data as any).image_url) {
          profileData.imageUrl = (data as any).image_url
          console.log('Fixed imageUrl mapping after initial mapping:', profileData.imageUrl)
        }
        
        // Final verification before setting state
        console.log('Final profileData before setProfile:', {
          hasImageUrl: !!profileData.imageUrl,
          imageUrl: profileData.imageUrl
        })
        
        setProfile(profileData)
        
        // If onboarding and profile is minimal, auto-enter edit mode
        if (isOnboarding && isMinimalProfile) {
          setTimeout(() => {
            startEditing()
          }, 500)
        }
      } else {
        // No data returned - no profile exists
        console.log('No profile data returned for email:', normalizedEmail)
        setProfile(null)
        
        // If onboarding, auto-enter edit mode
        if (isOnboarding) {
          setTimeout(() => {
            setEditing(true)
          }, 500)
        }
      }
    } catch (error) {
      console.error('Exception in fetchProfile:', error)
      setProfile(null)
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

      // Normalize email before saving (industry best practice - ensures consistency)
      const normalizedEmail = (formData.email || user?.email || '').toLowerCase().trim()
      
      // Map TypeScript interface to database fields (imageUrl -> image_url)
      // Note: services are stored in separate table, not in professionals table
      console.log('handleSave - formData before mapping:', {
        formDataImageUrl: formData.imageUrl,
        hasImageUrl: !!formData.imageUrl,
        imageUrlType: typeof formData.imageUrl,
        imageUrlLength: formData.imageUrl?.length,
        formDataKeys: Object.keys(formData),
        fullFormData: formData
      })
      
      // CRITICAL: If imageUrl exists in formData but is not being saved, this will catch it
      if (!formData.imageUrl) {
        console.warn('⚠️ WARNING: formData.imageUrl is empty/null. Image will not be saved to database!')
      }
      
      // CRITICAL: Ensure image_url is saved - check multiple sources
      const imageUrlToSave = formData.imageUrl || 
                            profile?.imageUrl || 
                            (profile as any)?.image_url || 
                            null
      
      console.log('Determining image_url to save:', {
        formDataImageUrl: formData.imageUrl,
        profileImageUrl: profile?.imageUrl,
        profileImage_url: (profile as any)?.image_url,
        finalImageUrlToSave: imageUrlToSave
      })
      
      const profileData = {
        name: formData.name || '',
        profession: formData.profession || '',
        category: formData.category || 'other',
        email: normalizedEmail, // Always store in lowercase
        phone: formData.phone || '',
        location: formData.location || '',
        experience: formData.experience || 0,
        description: formData.description || '',
        availability: formData.availability || '',
        image_url: imageUrlToSave || null, // Use the determined image URL - explicitly set to null if empty
        website: formData.website || null,
        is_visible: formData.is_visible !== undefined ? formData.is_visible : true, // Default to visible
        updated_at: new Date().toISOString()
      }
      
      console.log('handleSave - profileData to save:', {
        image_url: profileData.image_url,
        hasImage_url: !!profileData.image_url,
        image_urlType: typeof profileData.image_url,
        image_urlLength: profileData.image_url?.length,
        fullProfileData: profileData
      })
      
      // Final check before saving
      if (!profileData.image_url && formData.imageUrl) {
        console.error('❌ ERROR: image_url is null but formData.imageUrl exists! This should not happen.')
        console.error('formData.imageUrl:', formData.imageUrl)
        // Force it to be saved
        profileData.image_url = formData.imageUrl
        console.log('✅ Fixed: Forced image_url to formData.imageUrl')
      }

      // Use insert or update based on whether profile exists (industry best practice)
      let updatedProfile: any = null
      let profileId: string | null = null
      
      if (profile?.id) {
        // Update existing profile
        profileId = profile.id
        console.log('Updating existing profile with ID:', profileId, 'and image_url:', profileData.image_url)
        const { data, error } = await supabase
          .from('professionals')
          // @ts-ignore
          .update(profileData)
          .eq('email', normalizedEmail)
          .select()
          .single()

        if (error) {
          console.error('Error updating profile:', error)
          setSavingStatus('error')
          setSaving(false)
          return
        }
        
        console.log('✅ Profile updated successfully. Response:', {
          data: data,
          image_url_in_response: (data as any)?.image_url,
          hasImage_url: !!(data as any)?.image_url,
          image_url_value: (data as any)?.image_url,
          allKeys: Object.keys(data || {}),
          fullResponse: data
        })
        
        // CRITICAL: Verify image_url was actually saved
        if (!(data as any)?.image_url && profileData.image_url) {
          console.error('❌ CRITICAL ERROR: image_url was sent but not returned in response!')
          console.error('Sent image_url:', profileData.image_url)
          console.error('Response data:', data)
          // Don't fail, but log the issue - might be a database/RLS issue
        } else if ((data as any)?.image_url) {
          console.log('✅ Verified: image_url was successfully saved to database')
        }
        
        updatedProfile = data
        profileId = data.id
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('professionals')
          // @ts-ignore
          .insert({ 
            ...profileData, 
            email: normalizedEmail,
            rating: 0,
            verified: false
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating profile:', error)
          setSavingStatus('error')
          setSaving(false)
          return
        }
        
        console.log('✅ Profile created successfully. Response:', {
          data: data,
          image_url_in_response: (data as any)?.image_url,
          hasImage_url: !!(data as any)?.image_url,
          allKeys: Object.keys(data || {})
        })
        
        updatedProfile = data
        profileId = data.id
      }

      // Handle services separately (stored in services table)
      if (profileId && formData.services) {
        // Delete existing services for this profile
        await supabase
          .from('services')
          .delete()
          .eq('professional_id', profileId)

        // Insert new services
        if (formData.services.length > 0) {
          const servicesToInsert = formData.services.map(service => ({
            professional_id: profileId,
            service_name: service
          }))

          const { error: servicesError } = await supabase
            .from('services')
            // @ts-ignore
            .insert(servicesToInsert)

          if (servicesError) {
            console.error('Error updating services:', servicesError)
            // Don't fail the whole save if services fail
          }
        }
      }

      // Fetch the updated profile with services to get complete data
      console.log('🔄 Fetching complete profile after save with ID:', profileId)
      const { data: completeProfileData, error: fetchError } = await supabase
        .from('professionals')
        .select(`
          *,
          services (
            service_name
          )
        `)
        .eq('id', profileId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching updated profile:', fetchError)
        // Use the data we already have
      } else {
        console.log('✅ Complete profile fetched after save:', {
          completeProfileData: completeProfileData,
          image_url_in_fetched: (completeProfileData as any)?.image_url,
          hasImage_url: !!(completeProfileData as any)?.image_url,
          image_url_value: (completeProfileData as any)?.image_url,
          image_url_length: (completeProfileData as any)?.image_url?.length,
          allKeys: Object.keys(completeProfileData || {}),
          fullFetchedData: completeProfileData
        })
        
        // CRITICAL: Verify image_url is in the fetched data
        if (!(completeProfileData as any)?.image_url && profileData.image_url) {
          console.error('❌ CRITICAL: image_url was saved but not found in re-fetch!')
          console.error('This might indicate a database issue or RLS policy problem')
        } else if ((completeProfileData as any)?.image_url) {
          console.log('✅ Verified: image_url exists in re-fetched profile')
        }
      }

      const finalProfileData = completeProfileData || updatedProfile
      
      console.log('Final profile data before mapping:', {
        finalProfileData: finalProfileData,
        image_url: (finalProfileData as any)?.image_url,
        hasImage_url: !!(finalProfileData as any)?.image_url
      })

      // Map database fields back to TypeScript interface
      const servicesArray = Array.isArray(finalProfileData?.services)
        ? finalProfileData.services.map((s: any) => s.service_name || s).filter(Boolean)
        : (formData.services || [])

      // Explicitly map image_url to imageUrl (industry best practice)
      const mappedImageUrl = (finalProfileData as any)?.image_url || 
                             (updatedProfile as any)?.image_url || 
                             profile?.imageUrl || 
                             formData.imageUrl || 
                             undefined
      
      console.log('After save - mapping imageUrl:', {
        finalProfileData_image_url: (finalProfileData as any)?.image_url,
        finalProfileData_keys: finalProfileData ? Object.keys(finalProfileData) : [],
        updatedProfile_image_url: (updatedProfile as any)?.image_url,
        updatedProfile_keys: updatedProfile ? Object.keys(updatedProfile) : [],
        profile_imageUrl: profile?.imageUrl,
        formData_imageUrl: formData.imageUrl,
        mappedImageUrl: mappedImageUrl,
        fullFinalProfileData: finalProfileData,
        fullUpdatedProfile: updatedProfile
      })
      
      // CRITICAL: Explicitly construct completeProfile to ensure imageUrl is always set correctly
      // Don't rely on spread operator which might lose the mapping
      const completeProfile: ProfileData = {
        id: profileId || profile?.id || updatedProfile?.id || finalProfileData?.id || '',
        name: finalProfileData?.name || updatedProfile?.name || profile?.name || formData.name || '',
        email: finalProfileData?.email || updatedProfile?.email || profile?.email || formData.email || normalizedEmail,
        profession: finalProfileData?.profession || updatedProfile?.profession || profile?.profession || formData.profession || '',
        category: finalProfileData?.category || updatedProfile?.category || profile?.category || formData.category || 'other',
        phone: finalProfileData?.phone || updatedProfile?.phone || profile?.phone || formData.phone || '',
        location: finalProfileData?.location || updatedProfile?.location || profile?.location || formData.location || '',
        experience: finalProfileData?.experience || updatedProfile?.experience || profile?.experience || formData.experience || 0,
        description: finalProfileData?.description || updatedProfile?.description || profile?.description || formData.description || '',
        availability: finalProfileData?.availability || updatedProfile?.availability || profile?.availability || formData.availability || '',
        rating: profile?.rating ?? updatedProfile?.rating ?? finalProfileData?.rating ?? 0,
        verified: profile?.verified ?? updatedProfile?.verified ?? finalProfileData?.verified ?? false,
        createdAt: (finalProfileData as any)?.created_at || profile?.createdAt || updatedProfile?.createdAt || new Date().toISOString(),
        // CRITICAL: Explicitly map image_url to imageUrl - this is the key fix
        imageUrl: mappedImageUrl || undefined,
        services: servicesArray,
        website: finalProfileData?.website || updatedProfile?.website || profile?.website || formData.website,
        is_visible: (finalProfileData as any)?.is_visible !== undefined 
          ? (finalProfileData as any).is_visible 
          : (updatedProfile as any)?.is_visible !== undefined 
            ? (updatedProfile as any).is_visible 
            : profile?.is_visible !== undefined 
              ? profile.is_visible 
              : true, // Default to visible
        stats: profile?.stats || updatedProfile?.stats || {
          jobsCompleted: 0,
          repeatClients: 0,
          responseRate: 95,
          avgResponseTime: '2 hours'
        },
        updated_at: (finalProfileData as any)?.updated_at || updatedProfile?.updated_at || new Date().toISOString()
      } as ProfileData
      
      // Final safety check: ensure imageUrl is set
      if (!completeProfile.imageUrl && mappedImageUrl) {
        console.warn('⚠️ completeProfile.imageUrl was not set, forcing it from mappedImageUrl')
        completeProfile.imageUrl = mappedImageUrl
      }
      
      // Ultimate fallback: if still no imageUrl, use formData.imageUrl (the one we just saved)
      if (!completeProfile.imageUrl && formData.imageUrl) {
        console.warn('⚠️ completeProfile.imageUrl still not set, using formData.imageUrl as ultimate fallback')
        completeProfile.imageUrl = formData.imageUrl
      }

      console.log('Complete profile after save:', { 
        imageUrl: completeProfile.imageUrl,
        hasImage: !!completeProfile.imageUrl,
        imageUrlType: typeof completeProfile.imageUrl,
        services: completeProfile.services 
      })

      setProfile(completeProfile)
      setFormData(completeProfile)
      setOriginalData(completeProfile)
      setHasChanges(false)
      setEditing(false)
      setSavingStatus('success')
      setIsOnboarding(false) // Clear onboarding flag after save
      
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

  const validateForm = (): boolean => {
    const result = validateFormUtil(formData)
    setErrors(result.errors)
    return result.isValid
  }

  const startEditing = () => {
    // Initialize formData from profile (single source of truth)
    if (profile) {
      // CRITICAL: Explicitly map image_url to imageUrl for edit mode
      const imageUrlForEdit = profile.imageUrl || (profile as any).image_url || undefined
      
      console.log('startEditing - mapping imageUrl:', {
        profileImageUrl: profile.imageUrl,
        profileImage_url: (profile as any).image_url,
        imageUrlForEdit: imageUrlForEdit,
        profileKeys: Object.keys(profile)
      })
      
      const profileFormData = {
        ...profile,
        // Explicitly ensure imageUrl is set from image_url if needed
        imageUrl: imageUrlForEdit
      }
      
      console.log('startEditing - profileFormData:', {
        imageUrl: profileFormData.imageUrl,
        hasImageUrl: !!profileFormData.imageUrl,
        imageUrlType: typeof profileFormData.imageUrl
      })
      
      setFormData(profileFormData)
      setOriginalData(profileFormData)
    }
    setErrors({})
    setHasChanges(false)
    setEditing(true)
    setSavingStatus('idle')
  }

  const cancelEditing = () => {
    // Reset formData to match current profile state
    if (profile) {
      const profileFormData = {
        ...profile,
        imageUrl: profile.imageUrl || (profile as any).image_url || undefined
      }
      setFormData(profileFormData)
    }
    setErrors({})
    setHasChanges(false)
    setEditing(false)
    setSavingStatus('idle')
  }

  const handleFieldChange = (field: keyof ProfileData, value: any) => {
    const updatedFormData = { ...formData, [field]: value }
    
    // Special logging for imageUrl changes
    if (field === 'imageUrl') {
      console.log('handleFieldChange - imageUrl updated:', {
        oldValue: formData.imageUrl,
        newValue: value,
        field: field,
        updatedFormDataImageUrl: updatedFormData.imageUrl
      })
    }
    
    setFormData(updatedFormData)

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }

    // Check if there are changes compared to original data
    const hasFieldChanged = JSON.stringify(updatedFormData[field]) !== JSON.stringify(originalData[field])
    const hasOtherChanges = (Object.keys(updatedFormData) as Array<keyof ProfileData>).some(key =>
      JSON.stringify(updatedFormData[key]) !== JSON.stringify(originalData[key])
    )
    setHasChanges(hasFieldChanged || hasOtherChanges)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={handleSignOut} />

      <div className="container mx-auto px-4 py-8">
        {/* Onboarding Welcome Banner - Industry Best Practice */}
        {isOnboarding && (editing || !profile) && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to KhojCity! 👋
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Complete your profile to help clients find you. You can skip and complete it later if you prefer.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Get discovered by clients
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Showcase your expertise
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Build your professional presence
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOnboarding(false)
                    router.push('/profile')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close welcome message"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show create mode message if no profile and not editing */}
        {!profile && !loading && !editing && (
          <div className="max-w-3xl mx-auto text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Profile Found</h2>
            <p className="text-gray-600 mb-6">Please create your profile to get started.</p>
            <Button onClick={() => setEditing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create Profile
            </Button>
          </div>
        )}

        {/* Show view mode only if profile exists and not editing */}
        {profile && !editing ? (
          <>
            {/* View Mode - Original Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                      {/* Profile Image */}
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                          {(() => {
                            // Get image URL from profile (handle both imageUrl and image_url)
                            // Try multiple sources to ensure we get the image
                            const imageUrl = profile.imageUrl || 
                                           (profile as any).image_url || 
                                           (profile as any).imageUrl ||
                                           undefined
                            
        // Reduced logging - only log if there's actually an issue
        if (!imageUrl) {
          // Only log once, not on every render
          if (!(window as any).__imageWarningLogged) {
            console.log('ℹ️ No profile image found. Upload an image in edit mode and click "Save Changes" to add one.')
            ;(window as any).__imageWarningLogged = true
          }
        }
                            
                            if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                              return (
                                <img 
                                  src={imageUrl} 
                                  alt={profile.name}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    // Fallback to default avatar if image fails to load
                                    console.error('Image failed to load:', {
                                      imageUrl: imageUrl,
                                      error: e,
                                      imageSrc: (e.target as HTMLImageElement).src
                                    })
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully:', imageUrl)
                                  }}
                                />
                              )
                            } else {
                              // No image - show default avatar (no console spam)
                              return <User className="h-12 w-12 text-white" />
                            }
                          })()}
                        </div>
                      </div>
                      
                      {/* Basic Info */}
                      <div className="flex-1">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                          <p className="text-lg text-gray-600">{profile.profession}</p>
                        </div>
                        
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
                    <Button onClick={startEditing}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
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
                  <p className="text-gray-700 leading-relaxed">
                    {profile.description || 'No description provided yet.'}
                  </p>
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
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
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

              {/* Profile Visibility - Only show if profile exists */}
              {profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <EyeOff className="h-5 w-5" />
                      Profile Visibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Show in Search Results</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.is_visible !== false 
                            ? 'Your profile is visible to everyone' 
                            : 'Your profile is hidden from search results'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.is_visible !== false ? (
                          <Eye className="h-5 w-5 text-green-500" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={async () => {
                        const newVisibility = !(profile.is_visible !== false)
                        try {
                          // Use email-based update for better compatibility
                          const normalizedEmail = (profile.email || user?.email || '').toLowerCase().trim()
                          const { error } = await supabase
                            .from('professionals')
                            // @ts-expect-error - is_visible might not exist in type yet
                            .update({ is_visible: newVisibility })
                            .eq('email', normalizedEmail)
                          
                          if (error) {
                            console.error('Error updating visibility:', error)
                            // Check if error is due to missing column
                            if (error.message?.includes('column') && error.message?.includes('is_visible')) {
                              alert('⚠️ Profile visibility feature requires database migration.\n\nPlease run the SQL migration file:\ndatabase/add-is-visible-field.sql\n\nIn Supabase Dashboard → SQL Editor')
                            } else if (error.code === '42703' || error.message?.includes('does not exist')) {
                              alert('⚠️ Profile visibility feature requires database migration.\n\nPlease run the SQL migration file:\ndatabase/add-is-visible-field.sql\n\nIn Supabase Dashboard → SQL Editor')
                            } else {
                              alert(`Failed to update profile visibility: ${error.message || 'Unknown error'}`)
                            }
                            return
                          }
                          
                          // Update local state
                          setProfile({ ...profile, is_visible: newVisibility })
                          setFormData({ ...formData, is_visible: newVisibility })
                          
                          // Show success message
                          setSavingStatus('success')
                          setTimeout(() => setSavingStatus('idle'), 2000)
                        } catch (error: any) {
                          console.error('Error updating visibility:', error)
                          if (error?.message?.includes('column') || error?.message?.includes('does not exist') || error?.code === '42703') {
                            alert('⚠️ Profile visibility feature requires database migration.\n\nPlease run the SQL migration file:\ndatabase/add-is-visible-field.sql\n\nIn Supabase Dashboard → SQL Editor')
                          } else {
                            alert(`Failed to update profile visibility: ${error?.message || 'Unknown error'}`)
                          }
                        }
                      }}
                    >
                      {profile.is_visible !== false ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Profile
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show Profile
                        </>
                      )}
                    </Button>
                    {profile.is_visible === false && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                        ⚠️ Your profile is hidden. Clients won't be able to find you in search results.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile?.id && (
                    <Link href={`/profile/${profile.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Public Profile
                      </Button>
                    </Link>
                  )}
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                    <span className="ml-2 text-xs text-gray-400">(Coming Soon)</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          </>
        ) : (
          // Edit Mode - Clean Form Layout (works for both create and edit)
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Show different title based on create vs edit */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile ? 'Edit Your Profile' : 'Create Your Profile'}
              </h1>
              {!profile && (
                <p className="text-gray-600 mb-4">Fill in your details to create your professional profile.</p>
              )}
              
              {/* Profile Completion Progress - Industry Best Practice */}
              {profile && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {(() => {
                        const fields = ['name', 'profession', 'phone', 'location', 'description', 'availability', 'services']
                        const completed = fields.filter(field => {
                          if (field === 'services') return formData.services && formData.services.length > 0
                          return formData[field as keyof ProfileData] && String(formData[field as keyof ProfileData]).trim() !== ''
                        }).length
                        return `${Math.round((completed / fields.length) * 100)}%`
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(() => {
                          const fields = ['name', 'profession', 'phone', 'location', 'description', 'availability', 'services']
                          const completed = fields.filter(field => {
                            if (field === 'services') return formData.services && formData.services.length > 0
                            return formData[field as keyof ProfileData] && String(formData[field as keyof ProfileData]).trim() !== ''
                          }).length
                          return (completed / fields.length) * 100
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {/* Status Messages */}
            {savingStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4" />
                Profile saved successfully!
              </div>
            )}
            {savingStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <X className="h-4 w-4" />
                Failed to save profile. Please check your inputs.
              </div>
            )}

            {/* Basic Information Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Basic Information
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Update your profile details</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Profile Photo */}
                <div>
                  <Label className="text-sm font-medium text-gray-900">Profile Photo</Label>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Upload a professional photo</p>
                  <div className="mt-2">
                    <ImageUpload
                      currentImage={(() => {
                        // CRITICAL: Get image URL from multiple sources to ensure it's displayed
                        // Priority: formData.imageUrl (most recent) > profile.imageUrl > profile.image_url
                        const imageUrl = formData.imageUrl || 
                                       profile?.imageUrl || 
                                       (profile as any)?.image_url ||
                                       (formData as any)?.image_url ||
                                       undefined
                        
                        // Reduced logging - only log when image changes
                        if (imageUrl && !(window as any).__imageUrlLogged) {
                          console.log('🖼️ Image found for profile')
                          ;(window as any).__imageUrlLogged = true
                        }
                        
                        return imageUrl || undefined // Ensure it's undefined, not empty string
                      })()}
                      onImageChange={(url) => {
                        console.log('✅ ImageUpload onImageChange called with URL:', url)
                        if (url && url.trim() !== '') {
                          handleFieldChange('imageUrl', url)
                          console.log('✅ Image URL set in formData. Remember to click SAVE to persist to database!')
                          console.log('✅ hasChanges set to true - Save button should be enabled')
                          // CRITICAL: Ensure hasChanges is set so Save button is enabled
                          setHasChanges(true)
                        } else {
                          console.warn('⚠️ ImageUpload returned null/undefined/empty URL')
                          handleFieldChange('imageUrl', undefined)
                        }
                      }}
                      className="max-w-xs mx-auto"
                    />
                    {formData.imageUrl && !profile?.imageUrl && !(profile as any)?.image_url && (
                      <div className="text-xs text-amber-700 mt-2 text-center space-y-1 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm">
                        <p className="font-bold text-sm">⚠️ IMPORTANT: Photo uploaded but not saved!</p>
                        <p className="text-xs font-medium">Click the <strong className="text-green-700">"Save Changes"</strong> button below to save your photo to your profile.</p>
                        <p className="text-[10px] text-gray-600 mt-1 italic">Your photo will be lost if you navigate away without saving.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name and Profession */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-900">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={`mt-2 h-11 border-gray-300 rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="profession" className="text-sm font-medium text-gray-900">Profession <span className="text-red-500">*</span></Label>
                    <Input
                      id="profession"
                      value={formData.profession || ''}
                      onChange={(e) => handleFieldChange('profession', e.target.value)}
                      placeholder="e.g., Software Engineer, Plumber"
                      className={`mt-2 h-11 border-gray-300 rounded-lg ${errors.profession ? 'border-red-500' : ''}`}
                    />
                    {errors.profession && <p className="text-sm text-red-600 mt-1.5">{errors.profession}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  About
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Describe your professional background</p>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Tell us about yourself, your experience, and what makes you unique..."
                  rows={5}
                  className="border-gray-300 rounded-lg resize-none"
                />
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  Services Offered
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">List the services you provide</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add a service..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                    className="h-11 border-gray-300 rounded-lg"
                  />
                  <Button onClick={addService} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {formData.services && formData.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {formData.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="pr-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        {service}
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="ml-2 hover:text-red-600 transition-colors"
                          aria-label={`Remove ${service}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-indigo-600" />
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
                      value={formData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="mt-2 h-11 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="e.g., +1 (555) 123-4567"
                      className="mt-2 h-11 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder="City, State"
                      className="mt-2 h-11 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="availability" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Availability <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="availability"
                      value={formData.availability || ''}
                      onChange={(e) => handleFieldChange('availability', e.target.value)}
                      placeholder="e.g., Mon-Fri: 9AM-5PM"
                      className="mt-2 h-11 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="mt-2 h-11 border-gray-300 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex gap-3">
                {isOnboarding ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsOnboarding(false)
                        cancelEditing()
                        router.push('/profile')
                      }}
                      disabled={saving}
                      className="border-gray-300"
                    >
                      Skip for Now
                    </Button>
                    <Button 
                      onClick={async () => {
                        await handleSave()
                        setIsOnboarding(false)
                        router.push('/profile')
                      }} 
                      disabled={saving || !hasChanges}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]"
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Complete Profile
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={cancelEditing}
                      disabled={saving}
                      className="border-gray-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]"
                      title={!hasChanges ? 'No changes to save' : 'Save your profile changes'}
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
