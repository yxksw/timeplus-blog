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
      className="fixed inset-0 z-[1000]"
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Close Button */}
      <button 
        className="absolute top-3 right-3 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="关闭"
      >
        <X size={22} />
      </button>
      
      {/* Navigation Arrows - Desktop */}
      {images.length > 1 && (
        <>
          <button
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="上一张"
          >
            <ChevronLeft size={28} className="text-white" />
          </button>
          <button
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="下一张"
          >
            <ChevronRight size={28} className="text-white" />
          </button>
        </>
      )}
      
      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Image Area */}
        <div 
          className="flex-1 flex items-center justify-center relative px-4 py-16 md:py-20"
          onClick={handleImageClick}
          style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
        >
          <img 
            src={currentImage} 
            alt={post.title}
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ 
              transform: `scale(${scale})`,
              transition: 'transform 0.3s ease'
            }}
          />
          
          {/* Zoom Button */}
          <button
            className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); handleImageClick(); }}
          >
            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>

          {/* Mobile Swipe Areas */}
          {images.length > 1 && (
            <>
              <div 
                className="absolute left-0 top-0 bottom-0 w-1/4 md:hidden"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-1/4 md:hidden"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
              />
            </>
          )}
        </div>
        
        {/* Info Panel */}
        <div className="bg-[#1d1e22] px-4 py-4 md:py-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-white text-lg md:text-xl font-bold mb-2">{post.title}</h2>
            
            {post.excerpt && (
              <p className="text-white/60 text-sm mb-3">{post.excerpt}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mb-3">
              {post.device && (
                <span className="flex items-center gap-1">
                  <Camera size={12} />
                  {post.device}
                </span>
              )}
              {post.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {post.location}
                </span>
              )}
              <span>{formatDate(post.date)}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs text-white/80">
                {post.category}
              </span>
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-white/40 text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === imageIndex 
                  ? 'bg-white w-5' 
                  : 'bg-white/40 w-1.5'
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
