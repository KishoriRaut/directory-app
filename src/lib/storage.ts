import { supabase } from './supabase'

export interface UploadResult {
  publicUrl: string | null
  error: string | null
}

export class StorageService {
  private static readonly BUCKET_NAME = 'my-photo' // Your existing bucket name

  /**
   * Upload a profile image to Supabase Storage
   */
  static async uploadProfileImage(file: File, userId: string): Promise<UploadResult> {
    try {
      // Validate file
      if (!file) {
        return { publicUrl: null, error: 'No file provided' }
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        return { publicUrl: null, error: 'File size must be less than 5MB' }
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return { publicUrl: null, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return { publicUrl: null, error: 'You must be logged in to upload images' }
      }

      console.log('Uploading to bucket:', this.BUCKET_NAME)
      console.log('File path:', filePath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Upload error details:', error)
        return { publicUrl: null, error: `Upload failed: ${error.message}` }
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)

      return { publicUrl, error: null }

    } catch (error) {
      console.error('Upload error:', error)
      return { publicUrl: null, error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  /**
   * Delete a profile image from Supabase Storage
   */
  static async deleteProfileImage(imageUrl: string): Promise<{ error: string | null }> {
    try {
      if (!imageUrl) {
        return { error: null }
      }

      // Extract file path from URL
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `profiles/${fileName}`

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        return { error: error.message }
      }

      return { error: null }

    } catch (error) {
      console.error('Delete error:', error)
      return { error: 'Failed to delete image' }
    }
  }

  /**
   * Update professional profile with image URL
   */
  static async updateProfessionalImage(
    professionalId: string, 
    imageUrl: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ image_url: imageUrl })
        .eq('id', professionalId)

      if (error) {
        console.error('Update error:', error)
        return { error: error.message }
      }

      return { error: null }

    } catch (error) {
      console.error('Update error:', error)
      return { error: 'Failed to update profile image' }
    }
  }

  /**
   * Get default avatar URL
   */
  static getDefaultAvatarUrl(): string {
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl('default-avatar.png')
    
    return publicUrl
  }

  /**
   * Compress image before upload (client-side)
   */
  static async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Return original if compression fails
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => resolve(file) // Return original if loading fails
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): { isValid: boolean; error: string | null } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' }
    }

    return { isValid: true, error: null }
  }
}
