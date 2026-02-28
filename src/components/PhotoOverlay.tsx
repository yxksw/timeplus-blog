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
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
        aria-label="关闭"
      >
        <X size={22} />
      </button>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full items-center justify-center px-16">
        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="上一张"
          >
            <ChevronLeft size={28} className="text-white" />
          </button>
        )}
        
        {/* Image Container */}
        <div 
          className="relative max-w-5xl max-h-[80vh]"
          onClick={handleImageClick}
          style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
        >
          <img 
            src={currentImage} 
            alt={post.title}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            style={{ 
              transform: `scale(${scale})`,
              transition: 'transform 0.3s ease'
            }}
          />
          
          {/* Caption Overlay - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
            <h2 className="text-white text-xl font-bold mb-2">{post.title}</h2>
            
            {post.excerpt && (
              <p className="text-white/70 text-sm mb-3">{post.excerpt}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
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
            
            <div className="mt-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white/80">
                {post.category}
              </span>
            </div>
          </div>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
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
        
        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="下一张"
          >
            <ChevronRight size={28} className="text-white" />
          </button>
        )}
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={22} />
          </button>
          
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
            className="max-w-full max-h-[45vh] object-contain rounded-lg"
            style={{ 
              transform: `scale(${scale})`,
              transition: 'transform 0.3s ease'
            }}
          />
          
          {/* Mobile Swipe Areas */}
          {images.length > 1 && (
            <>
              <div 
                className="absolute left-0 top-0 bottom-0 w-1/5"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-1/5"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
              />
            </>
          )}
        </div>
        
        {/* Info Panel */}
        <div className="px-5 pb-6 pt-2">
          <h2 className="text-white text-lg font-bold mb-1">{post.title}</h2>
          
          {post.excerpt && (
            <p className="text-white/60 text-sm mb-3">{post.excerpt}</p>
          )}
          
          <div className="space-y-1.5 mb-3">
            {post.device && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Camera size={14} className="text-white/50" />
                <span>{post.device}</span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin size={14} className="text-white/50" />
                <span>{post.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Clock size={14} className="text-white/50" />
              <span>{formatDate(post.date)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">
              {post.category}
            </span>
          </div>
        </div>
        
        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="pb-4 flex justify-center gap-2">
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
    </div>
  )
}
