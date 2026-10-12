import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Camera, Lock, X, FileUp, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Reveal } from '../../components/Reveal.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../api/client.js'
import { fetchVendor } from '../../api/vendors.js'
import { VendorSidebar } from '../../components/VendorSidebar.jsx'

export default function VendorPortfolio() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [sidebarOpen] = useState(() => window.innerWidth >= 1024)
  const [isDragging, setIsDragging] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Load current vendor profile via the auth me endpoint
  const { data, isLoading } = useQuery({
    queryKey: ['my-vendor'],
    queryFn: async () => (await api.get('/auth/me')).data,
    enabled: !!user,
  })

  const vendorSlug = data?.vendor?.slug
  const detailQ = useQuery({
    queryKey: ['my-vendor-detail', vendorSlug],
    queryFn: () => fetchVendor(vendorSlug),
    enabled: !!vendorSlug,
  })

  const v = detailQ.data?.vendor ?? detailQ.data
  const tier = v?.subscription_tier ?? 'free'
  const maxPhotosLimit = tier === 'elite' ? 25 : tier === 'premium' ? 10 : 3
  const photos = v?.photos ?? []

  const handlePrevPhoto = (e) => {
    e.stopPropagation()
    if (!photos || photos.length === 0) return
    setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const handleNextPhoto = (e) => {
    e.stopPropagation()
    if (!photos || photos.length === 0) return
    setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') handlePrevPhoto(e)
      if (e.key === 'ArrowRight') handleNextPhoto(e)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, photos])

  const uploadMultipleFiles = async (filesList) => {
    const images = Array.from(filesList).filter(f => f.type.startsWith('image/'))
    if (images.length === 0) {
      toast.error('Only image files are supported')
      return
    }

    const availableSlots = maxPhotosLimit - photos.length
    if (availableSlots <= 0) {
      toast.error(`Limit reached! Your current tier allows up to ${maxPhotosLimit} photos. Upgrade your tier to upload more.`)
      return
    }

    let filesToUpload = images
    if (images.length > availableSlots) {
      toast.error(`You only have ${availableSlots} empty slot(s) left. Only uploading the first ${availableSlots} photo(s).`)
      filesToUpload = images.slice(0, availableSlots)
    }

    const toastId = toast.loading(`Uploading 1 of ${filesToUpload.length} photo(s)...`)

    let lastUpdatedVendor = null
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        if (i > 0) {
          toast.loading(`Uploading ${i + 1} of ${filesToUpload.length} photo(s)...`, { id: toastId })
        }
        const file = filesToUpload[i]
        const formData = new FormData()
        formData.append('photo', file)

        const { data: updatedVendor } = await api.post('/vendor-portal/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        lastUpdatedVendor = updatedVendor
      }

      if (lastUpdatedVendor) {
        qc.setQueryData(['my-vendor-detail', vendorSlug], { vendor: lastUpdatedVendor })
      }
      toast.success(`Successfully uploaded ${filesToUpload.length} photo(s) to your portfolio!`, { id: toastId })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload one or more photos.', { id: toastId })
    } finally {
      detailQ.refetch()
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length > 0) {
      uploadMultipleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) {
      uploadMultipleFiles(e.target.files)
    }
  }

  const handleDeletePhoto = async (path) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      toast.loading('Deleting photo...', { id: 'delete' })
      const { data: updatedVendor } = await api.post('/vendor-portal/delete-photo', { path })
      qc.setQueryData(['my-vendor-detail', vendorSlug], { vendor: updatedVendor })
      toast.success('Photo deleted successfully!', { id: 'delete' })
    } catch (err) {
      toast.error('Failed to delete photo.', { id: 'delete' })
    }
  }

  if (isLoading || detailQ.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#FAF8F5]">
        <div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" />
      </div>
    )
  }

  if (!v) {
    return (
      <div className="vendor-portal relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
        <VendorSidebar />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'} px-4 sm:px-6 lg:px-8 pt-28 pb-16 max-w-[1536px] mx-auto`}>
          <p className="font-display text-2xl text-burgundy-900 mt-20 text-center">No vendor profile linked to your account.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="vendor-portal relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <VendorSidebar />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'} px-4 sm:px-6 lg:px-8 pt-28 pb-16 max-w-[1536px] mx-auto`}>
        <div className="flex items-center justify-end gap-3 mb-2">
          {v.is_approved ? (
            <Link to={`/vendor/${v.slug}`} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blush-50 text-burgundy-800 border border-burgundy-200/60 hover:bg-blush-200">
              <ExternalLink className="w-3 h-3" /> View public page
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed text-xs"
              title="Public page is locked until your profile is published"
            >
              <ExternalLink className="w-3 h-3" /> View public page (Locked)
            </button>
          )}
        </div>

        <Reveal>
          <h1 className="font-display text-4xl text-burgundy-900 font-bold">Portfolio Gallery</h1>
          <p className="text-burgundy-700 mt-1">Upload high-resolution images showing off your works and wedding events.</p>
        </Reveal>

        <div className="mt-8 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-8 py-8 space-y-6">

            {/* Header Stats */}
            <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <p className="text-sm text-neutral-600 font-medium">
                Upload photos of your work to display in your storefront gallery carousel.
              </p>
              <span className="text-sm font-bold text-[#4E1218] bg-white border border-neutral-200 px-3 py-1 rounded-full shrink-0">
                Slots: {photos.length} / {maxPhotosLimit} Used
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            {photos.length < maxPhotosLimit ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition cursor-pointer text-center bg-neutral-50/30 min-h-[160px] ${
                  isDragging
                    ? 'border-[#4E1218] bg-[#4E1218]/5 ring-4 ring-[#4E1218]/5'
                    : 'border-neutral-300 hover:border-[#4E1218] hover:bg-neutral-50'
                }`}
              >
                <FileUp className={`w-8 h-8 mb-2 transition duration-300 ${isDragging ? 'text-[#4E1218] scale-110' : 'text-neutral-400'}`} />
                <p className="text-sm font-bold text-neutral-800">Drag & drop your photos here, or click to browse</p>
                <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">Supports JPG, PNG, WEBP (Max 5MB per photo · Multi-select enabled)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-neutral-200 bg-neutral-50 text-center min-h-[140px]">
                <p className="text-sm font-bold text-neutral-700">Portfolio Image Limit Reached</p>
                <p className="text-xs text-neutral-500 mt-0.5">Your current tier limit is {maxPhotosLimit} photos. Upgrade your subscription to upload more.</p>
                <Link to="/vendor-portal/subscription" className="text-xs text-red-600 hover:underline font-bold mt-2 inline-flex items-center gap-0.5">Upgrade Listing Tier ↗</Link>
              </div>
            )}

            {/* Photo Grid */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-neutral-800">
                Uploaded Photos ({photos.length})
              </h3>

              {photos.length === 0 ? (
                <div className="p-8 text-center border border-neutral-100 rounded-xl bg-neutral-50">
                  <p className="text-sm text-neutral-400 mt-2 font-medium">No portfolio photos uploaded yet. Drag & drop files above to start!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200 group bg-neutral-100 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <img src={p.startsWith('http') ? p : `/storage/${p}`} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePhoto(p)
                        }}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition cursor-pointer shadow-sm z-10"
                        title="Delete photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Fullscreen Lightbox Overlay */}
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Control */}
            {photos.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
                title="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Image */}
            <div className="relative max-w-[85vw] max-h-[80vh] flex flex-col items-center">
              <img
                src={photos[lightboxIndex].startsWith('http') ? photos[lightboxIndex] : `/storage/${photos[lightboxIndex]}`}
                alt={`Lightbox view ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="absolute bottom-[-30px] text-white/60 text-xs font-mono">
                {lightboxIndex + 1} / {photos.length}
              </span>
            </div>

            {/* Right Control */}
            {photos.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
                title="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
