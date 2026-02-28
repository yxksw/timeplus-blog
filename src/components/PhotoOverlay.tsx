'use client'

import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useEffect, useCallback, useState } from 'react'
import { Camera, MapPin, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'

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
      className="photo-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="photo-overlay-content relative max-w-5xl w-full mx-4">
        {/* Close Button */}
        <button 
          className="photo-overlay-close"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={24} />
        </button>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              aria-label="上一张"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              aria-label="下一张"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </>
        )}
        
        {/* Image Container with Zoom */}
        <div 
          className="overflow-hidden cursor-zoom-in"
          onClick={handleImageClick}
          style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
        >
          <img 
            src={currentImage} 
            alt={post.title}
            className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-300"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
        
        {/* Caption */}
        <div className="photo-caption">
          <h2 className="text-lg md:text-xl">{post.title}</h2>
          
          {post.excerpt && (
            <p className="text-sm opacity-80 mt-1">{post.excerpt}</p>
          )}
          
          <div className="tag-info-bottom mt-2">
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
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(post.date)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="tag-categorys">
              <span>{post.category}</span>
            </span>
            {post.tags.length > 0 && (
              <span className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-white/80 text-sm">#{tag}</span>
                ))}
              </span>
            )}
          </div>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="flex gap-2 justify-center mt-4">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === imageIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  onClick={(e) => { e.stopPropagation(); onImageSelect(index); }}
                  aria-label={`图片 ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
