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
        <div className="relative max-w-5xl max-h-[80vh]">
          <img 
            src={currentImage} 
            alt={post.title}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
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
      
      {/* Mobile Layout - Full Screen Scrollable */}
      <div className="md:hidden h-full overflow-y-auto">
        {/* Close Button */}
        <button 
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={22} />
        </button>
        
        {/* Image */}
        <div className="w-full min-h-[50vh] flex items-center justify-center p-4 pt-16">
          <img 
            src={currentImage} 
            alt={post.title}
            className="w-full max-w-lg object-contain rounded-lg"
          />
        </div>
        
        {/* Info Panel */}
        <div className="px-5 pb-8">
          <h2 className="text-white text-xl font-bold mb-2">{post.title}</h2>
          
          {post.excerpt && (
            <p className="text-white/70 text-base mb-4">{post.excerpt}</p>
          )}
          
          <div className="space-y-2 mb-4">
            {post.device && (
              <div className="flex items-center gap-2 text-white/80 text-base">
                <Camera size={18} className="text-white/50" />
                <span>{post.device}</span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center gap-2 text-white/80 text-base">
                <MapPin size={18} className="text-white/50" />
                <span>{post.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-white/80 text-base">
              <Clock size={18} className="text-white/50" />
              <span>{formatDate(post.date)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="text-white/70 text-base">
              {post.category}
            </span>
          </div>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2">
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
    </div>
  )
}
