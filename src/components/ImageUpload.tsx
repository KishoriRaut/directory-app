'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Camera, Loader2 } from 'lucide-react'
import { StorageService } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string | null) => void
  className?: string
}

export function ImageUpload({ currentImage, onImageChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update preview when currentImage prop changes (industry best practice)
  useEffect(() => {
    console.log('ImageUpload: currentImage prop changed:', {
      currentImage: currentImage,
      currentPreview: preview,
      willUpdate: currentImage !== preview,
      currentImageType: typeof currentImage,
      currentImageLength: currentImage?.length
    })
    
    // Always update preview to match currentImage, even if it's the same
    // This ensures the preview is in sync with the prop
    if (currentImage && currentImage.trim() !== '') {
      setPreview(currentImage)
      console.log('✅ Preview updated to:', currentImage)
      
      // Verify the image URL is accessible (test with actual GET request)
      if (currentImage.startsWith('http')) {
        // Test if image is actually accessible
        const testImg = new Image()
        testImg.onload = () => {
          console.log('✅ Image URL verified - image loads successfully')
        }
        testImg.onerror = (err) => {
          console.warn('⚠️ Image URL verification failed:', err)
          console.warn('This might indicate the bucket is not public or CORS issue')
        }
        testImg.src = currentImage
      }
    } else {
      // Only clear if we had a preview before (don't clear on initial mount if both are null)
      if (preview) {
        console.log('Clearing preview (currentImage is empty)')
        setPreview(null)
      }
    }
  }, [currentImage]) // Only depend on currentImage, not preview

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = StorageService.validateImage(file)
    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    setUploading(true)

    try {
      // Compress image
      const compressedFile = await StorageService.compressImage(file)
      
      // Get current user ID for filename
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        // Handle refresh token errors
        if (error.message?.includes('Refresh Token') || error.message?.includes('refresh_token')) {
          await supabase.auth.signOut()
          alert('Session expired. Please sign in again.')
          return
        }
      }
      if (!session) {
        alert('You must be logged in to upload images')
        return
      }
      
      // Upload to Supabase with user ID
      const result = await StorageService.uploadProfileImage(compressedFile, session.user.id)
      
      if (result.error) {
        alert('Upload failed: ' + result.error)
        return
      }

      if (result.publicUrl) {
        console.log('✅ Upload successful, setting preview and calling onImageChange:', result.publicUrl)
        setPreview(result.publicUrl)
        onImageChange(result.publicUrl)
        console.log('✅ Preview state updated, onImageChange called')
      } else {
        console.warn('⚠️ Upload succeeded but no publicUrl returned')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className={`border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${className}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Image Preview */}
          <div className="relative mx-auto w-32 h-32">
            {preview && preview.trim() !== '' ? (
              <div className="relative w-full h-full">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                  onLoad={() => {
                    console.log('✅ Image loaded successfully in preview:', preview)
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    const errorDetails = {
                      url: preview,
                      imgSrc: img.src,
                      naturalWidth: img.naturalWidth,
                      naturalHeight: img.naturalHeight,
                      complete: img.complete,
                      crossOrigin: img.crossOrigin,
                      referrerPolicy: img.referrerPolicy
                    }
                    
                    console.error('❌ Image failed to load in preview:', preview)
                    console.error('Error details:', errorDetails)
                    
                    // Try to fetch the image directly to get more error info
                    if (preview) {
                      fetch(preview, { method: 'GET', mode: 'cors' })
                        .then(response => {
                          console.error('Fetch response status:', response.status, response.statusText)
                          console.error('Fetch response headers:', Object.fromEntries(response.headers.entries()))
                          if (!response.ok) {
                            console.error('❌ Fetch failed with status:', response.status)
                            return response.text().then(text => {
                              console.error('Response body:', text.substring(0, 200))
                            })
                          }
                          return response.blob()
                        })
                        .then(blob => {
                          if (blob) {
                            console.log('✅ Fetch succeeded, blob size:', blob.size, 'type:', blob.type)
                            console.error('⚠️ Image loads via fetch but not in <img> tag - likely CORS or referrer issue')
                          }
                        })
                        .catch(fetchError => {
                          console.error('❌ Fetch also failed:', fetchError)
                          console.error('This confirms the URL is not accessible')
                        })
                    }
                    
                    // CRITICAL: Check if this is a Supabase Storage issue
                    if (preview?.includes('supabase.co')) {
                      console.error('🔍 DIAGNOSIS: Supabase Storage image load failure')
                      console.error('')
                      console.error('IMMEDIATE ACTION REQUIRED:')
                      console.error('1. Open this URL in a new browser tab:')
                      console.error('   ' + preview)
                      console.error('2. If it loads in browser → CORS/component issue')
                      console.error('3. If it does NOT load → Bucket not public or policy issue')
                      console.error('')
                      console.error('Check Supabase Dashboard:')
                      console.error('- Storage → Buckets → my-photo → Settings → Public bucket = ON')
                      console.error('- Storage → Policies → Verify "Public Access - my-photo" exists')
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <Camera className="h-8 w-8 text-gray-400" />
                {currentImage && currentImage.trim() !== '' && (
                  <div className="absolute bottom-0 left-0 right-0 text-xs text-red-600 bg-white/90 p-1 rounded">
                    ⚠️ Image URL exists but failed to load
                    <br />
                    <span className="text-[10px] text-gray-500">Check console for details</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
              aria-label="Upload profile image"
              title="Upload profile image"
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {preview ? 'Change Photo' : 'Upload Photo'}
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              JPEG, PNG, WebP up to 5MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
