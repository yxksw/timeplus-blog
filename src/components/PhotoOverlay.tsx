'use client'

import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useEffect, useCallback, useState } from 'react'
import { Camera, MapPin, Clock, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

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
      className="fixed inset-0 z-[1000] flex flex-col"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      {/* Header - Close Button */}
      <div className="flex items-center justify-between px-4 py-3">
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={22} />
        </button>
        
        {/* Desktop Navigation Arrows */}
        {images.length > 1 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              aria-label="上一张"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              aria-label="下一张"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        )}
        
        <button
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          onClick={handleImageClick}
        >
          {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </button>
      </div>
      
      {/* Image Area */}
      <div 
        className="flex-1 flex items-center justify-center px-4 relative"
        onClick={handleImageClick}
        style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
      >
        <img 
          src={currentImage} 
          alt={post.title}
          className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain rounded-lg"
          style={{ 
            transform: `scale(${scale})`,
            transition: 'transform 0.3s ease'
          }}
        />
        
        {/* Mobile Swipe Areas */}
        {images.length > 1 && (
          <>
            <div 
              className="absolute left-0 top-0 bottom-0 w-1/5 md:hidden"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
            />
            <div 
              className="absolute right-0 top-0 bottom-0 w-1/5 md:hidden"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
            />
          </>
        )}
      </div>
      
      {/* Info Panel */}
      <div className="px-5 pb-8 pt-4">
        <h2 className="text-white text-xl font-bold mb-1">{post.title}</h2>
        
        {post.excerpt && (
          <p className="text-white/60 text-sm mb-4">{post.excerpt}</p>
        )}
        
        <div className="space-y-2 mb-4">
          {post.device && (
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Camera size={16} className="text-white/50" />
              <span>{post.device}</span>
            </div>
          )}
          {post.location && (
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <MapPin size={16} className="text-white/50" />
              <span>{post.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Clock size={16} className="text-white/50" />
            <span>{formatDate(post.date)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80">
            {post.category}
          </span>
        </div>
      </div>
      
      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === imageIndex 
                  ? 'bg-white' 
                  : 'bg-white/40'
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
