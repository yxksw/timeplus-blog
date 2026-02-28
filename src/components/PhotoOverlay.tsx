'use client'

import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useEffect, useCallback, useState } from 'react'
import { Camera, MapPin, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

interface PhotoOverlayProps {
  post: BlogPost
  imageIndex: number
  images: string[]
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onImageSelect: (index: number) => void
}

export default function PhotoOverlay({
  post,
  imageIndex,
  images,
  onClose,
  onPrev,
  onNext,
  onImageSelect,
}: PhotoOverlayProps) {
  const [scale, setScale] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        onPrev()
        break
      case 'ArrowRight':
        onNext()
        break
    }
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const currentImage = images[imageIndex] || post.firstImage

  const handleImageClick = () => {
    if (isZoomed) {
      setScale(1)
      setIsZoomed(false)
    } else {
      setScale(2)
      setIsZoomed(true)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Close Button */}
      <button 
        className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-50"
        onClick={onClose}
        aria-label="关闭"
      >
        <X size={24} />
      </button>
      
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="上一张"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <button
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="下一张"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </>
      )}
      
      {/* Main Content Container */}
      <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center p-4 md:p-8">
        {/* Image Container */}
        <div 
          className="relative flex-1 flex items-center justify-center max-w-5xl w-full"
          onClick={handleImageClick}
          style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
        >
          <img 
            src={currentImage} 
            alt={post.title}
            className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
            style={{ transform: `scale(${scale})` }}
          />
          
          {/* Zoom Indicator */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); handleImageClick(); }}
          >
            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
        </div>
        
        {/* Info Panel - Bottom on mobile, right side on desktop */}
        <div className="mt-4 md:mt-0 md:ml-8 md:w-80 text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-2">{post.title}</h2>
          
          {post.excerpt && (
            <p className="text-sm md:text-base text-white/70 mb-4">{post.excerpt}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-white/60 mb-4">
            {post.device && (
              <span className="flex items-center gap-1">
                <Camera size={14} />
                {post.device}
              </span>
            )}
            {post.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {post.location}
              </span>
            )}
            <span>{formatDate(post.date)}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs">
              {post.category}
            </span>
            {post.tags.length > 0 && post.tags.map((tag) => (
              <span key={tag} className="text-white/50 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === imageIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              onClick={(e) => { e.stopPropagation(); onImageSelect(index); }}
              aria-label={`图片 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
