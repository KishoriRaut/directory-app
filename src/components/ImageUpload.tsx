'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Camera, Loader2 } from 'lucide-react'
import { StorageService } from '@/lib/storage'

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string | null) => void
  className?: string
}

export function ImageUpload({ currentImage, onImageChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      
      // Generate unique filename
      const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`
      
      // Upload to Supabase
      const result = await StorageService.uploadProfileImage(compressedFile, fileName)
      
      if (result.error) {
        alert('Upload failed: ' + result.error)
        return
      }

      if (result.publicUrl) {
        setPreview(result.publicUrl)
        onImageChange(result.publicUrl)
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
            {preview ? (
              <div className="relative w-full h-full">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
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
