import { supabase } from './supabase'
import { BUCKET_NAME, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants'

export interface UploadResult {
  publicUrl: string | null
  error: string | null
}

export class StorageService {
  /**
   * Upload a profile image to Supabase Storage
   */
  static async uploadProfileImage(file: File, userId: string): Promise<UploadResult> {
    try {
      // Validate file
      if (!file) {
        return { publicUrl: null, error: 'No file provided' }
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return { publicUrl: null, error: 'File size must be less than 5MB' }
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return { publicUrl: null, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Check authentication status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        // Handle refresh token errors
        if (sessionError.message?.includes('Refresh Token') || sessionError.message?.includes('refresh_token')) {
          await supabase.auth.signOut()
          return { publicUrl: null, error: 'Session expired. Please sign in again.' }
        }
      }
      if (!session) {
        console.error('No session found:', sessionError)
        return { publicUrl: null, error: 'You must be logged in to upload images' }
      }

      console.log('Uploading to bucket:', BUCKET_NAME)
      console.log('File path:', filePath)
      console.log('User ID:', session.user.id)
      console.log('User role:', session.user.role || 'authenticated')

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Upload error details:', error)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error('Error code:', (error as any).statusCode)
        console.error('Error message:', error.message)
        
        // Provide more helpful error messages
        if (error.message.includes('row-level security')) {
          return { 
            publicUrl: null, 
            error: 'Storage permission error. Please check RLS policies in Supabase Dashboard. Run database/storage-policies.sql migration.' 
          }
        }
        
        return { publicUrl: null, error: `Upload failed: ${error.message}` }
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)

      // CRITICAL: Verify the file exists and is accessible
      if (publicUrl) {
        // Try to verify the file exists by checking if we can list it
        const { data: fileList, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list('profiles', {
            limit: 1000,
            search: fileName
          })
        
        if (listError) {
          console.warn('⚠️ Could not verify file existence (this is OK if bucket is public):', listError)
        } else {
          const fileExists = fileList?.some(f => f.name === fileName)
          console.log('✅ File verified in storage:', fileExists)
          if (!fileExists) {
            console.error('❌ WARNING: File was uploaded but not found in storage listing!')
            console.error('This might indicate a bucket permission or RLS policy issue.')
          }
        }
      }

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
        .from(BUCKET_NAME)
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
        // @ts-ignore
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
      .from(BUCKET_NAME)
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
