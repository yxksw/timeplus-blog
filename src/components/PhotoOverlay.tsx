'use client'

import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useEffect, useCallback, useState, useRef } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontalSwipe = useRef(false)

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

  // Touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1 || isZoomed) return
    
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1 || isZoomed) return
    
    const touchX = e.touches[0].clientX
    const touchY = e.touches[0].clientY
    const diffX = touchX - touchStartX.current
    const diffY = touchY - touchStartY.current
    
    // Determine if this is a horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isHorizontalSwipe.current = true
      e.preventDefault()
      setDragOffset(diffX)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || images.length <= 1 || isZoomed) return
    
    setIsDragging(false)
    
    const threshold = 80 // Minimum swipe distance
    
    if (isHorizontalSwipe.current) {
      if (dragOffset > threshold) {
        onPrev()
      } else if (dragOffset < -threshold) {
        onNext()
      }
    }
    
    setDragOffset(0)
  }

  // Mouse events for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1 || isZoomed) return
    
    touchStartX.current = e.clientX
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || images.length <= 1 || isZoomed) return
    
    const diffX = e.clientX - touchStartX.current
    setDragOffset(diffX)
  }

  const handleMouseUp = () => {
    if (!isDragging || images.length <= 1 || isZoomed) return
    
    setIsDragging(false)
    
    const threshold = 80
    
    if (dragOffset > threshold) {
      onPrev()
    } else if (dragOffset < -threshold) {
      onNext()
    }
    
    setDragOffset(0)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      setDragOffset(0)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[1000]"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      {/* Close Button - Desktop Only */}
      <button 
        className="hidden md:flex absolute top-4 right-4 z-50 w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
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
      
      {/* Mobile Layout - Full Screen Scrollable with Swipe */}
      <div className="md:hidden h-full overflow-y-auto">
        {/* Close Button */}
        <button 
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={22} />
        </button>
        
        {/* Image Area with Swipe */}
        <div 
          ref={containerRef}
          className="w-full min-h-[50vh] flex items-center justify-center p-4 pt-16 relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Previous Image Preview */}
          {images.length > 1 && imageIndex > 0 && (
            <div 
              className="absolute left-0 top-0 bottom-0 w-20 opacity-30"
              style={{ transform: `translateX(${dragOffset - 80}px)` }}
            >
              <img 
                src={images[imageIndex - 1]} 
                alt="上一张"
                className="h-full object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Current Image */}
          <img 
            src={currentImage} 
            alt={post.title}
            className="w-full max-w-lg object-contain rounded-lg transition-transform duration-200"
            style={{ 
              transform: `translateX(${dragOffset}px) scale(${isDragging ? 0.95 : 1})`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          />
          
          {/* Next Image Preview */}
          {images.length > 1 && imageIndex < images.length - 1 && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-20 opacity-30"
              style={{ transform: `translateX(${dragOffset + 80}px)` }}
            >
              <img 
                src={images[imageIndex + 1]} 
                alt="下一张"
                className="h-full object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Swipe Hint */}
          {images.length > 1 && !isDragging && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
              左右滑动切换图片
            </div>
          )}
        </div>
        
        {/* Info Panel */}
        <div className="px-5 pb-8">
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
