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
  const [imageError, setImageError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const blobUrlRef = useRef<string | null>(null)

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
      setImageError(null)
      console.log('✅ Preview updated to:', currentImage)
      
      // If it's a Supabase URL, try to load via fetch and create blob URL as fallback
      if (currentImage.startsWith('http') && currentImage.includes('supabase.co')) {
        // Cleanup previous blob URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = null
        }
        
        // Try to fetch and create blob URL for CORS issues
        fetch(currentImage, { mode: 'cors', credentials: 'omit' })
          .then(async (response) => {
            if (!response.ok) {
              const text = await response.text()
              try {
                const json = JSON.parse(text)
                console.error('❌ Supabase returned error:', json)
                setImageError(json.message || json.error || 'Failed to load image')
              } catch {
                setImageError(`Failed to load image (${response.status})`)
              }
              return
            }
            
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.startsWith('application/json')) {
              // Response is JSON, not an image - likely an error
              const json = await response.json()
              console.error('❌ Supabase returned JSON error:', json)
              setImageError(json.message || json.error || 'Image not accessible')
              return
            }
            
            // It's actually an image, create blob URL
            const blob = await response.blob()
            if (blob.type.startsWith('image/')) {
              const url = URL.createObjectURL(blob)
              blobUrlRef.current = url
              setBlobUrl(url)
              console.log('✅ Created blob URL for image')
            } else {
              console.error('❌ Response is not an image, type:', blob.type)
              setImageError('Invalid image response')
            }
          })
          .catch((error) => {
            console.error('❌ Failed to fetch image:', error)
            setImageError('Failed to load image')
          })
      } else {
        // Clear blob URL if not a Supabase URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = null
          setBlobUrl(null)
        }
      }
    } else {
      // Only clear if we had a preview before (don't clear on initial mount if both are null)
      if (preview) {
        console.log('Clearing preview (currentImage is empty)')
        setPreview(null)
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = null
        }
        setBlobUrl(null)
        setImageError(null)
      }
    }
    
    // Cleanup on unmount or when currentImage changes
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]) // Only depend on currentImage, not preview (to avoid loops)

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

  return (
    <Card className={`border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${className}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Image Preview */}
          <div className="relative mx-auto w-32 h-32">
            {preview && preview.trim() !== '' ? (
              <div className="relative w-full h-full">
                {blobUrl ? (
                  // Use blob URL if available (workaround for CORS issues)
                  <img
                    src={blobUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                    onLoad={() => {
                      console.log('✅ Image loaded successfully via blob URL')
                      setImageError(null)
                    }}
                    onError={() => {
                      console.error('❌ Image failed to load even via blob URL')
                      setImageError('Failed to display image')
                    }}
                  />
                ) : (
                  // Try direct URL first
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onLoad={() => {
                      console.log('✅ Image loaded successfully in preview:', preview)
                      setImageError(null)
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      console.error('❌ Image failed to load in preview:', preview)
                      console.error('Error details:', {
                        url: preview,
                        imgSrc: img.src,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        complete: img.complete,
                        crossOrigin: img.crossOrigin,
                        referrerPolicy: img.referrerPolicy
                      })
                      
                      // If blob URL creation is in progress, wait for it
                      // Otherwise, show error
                      if (!blobUrl && preview?.includes('supabase.co')) {
                        setImageError('Loading image...')
                      }
                    }}
                  />
                )}
                {imageError && (
                  <div className="absolute inset-0 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center">
                    <div className="text-center p-2">
                      <p className="text-xs text-red-600 font-semibold">⚠️ Error</p>
                      <p className="text-[10px] text-red-500 mt-1">{imageError}</p>
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={handleRemoveImage}
                  aria-label="Remove profile image"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
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
              className="w-full focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label={uploading ? 'Uploading image, please wait' : preview ? 'Change profile photo' : 'Upload profile photo'}
              aria-busy={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                  <span>{preview ? 'Change Photo' : 'Upload Photo'}</span>
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
