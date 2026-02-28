'use client'

import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useEffect, useCallback } from 'react'

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
      className="photo-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="photo-overlay-content relative max-w-5xl">
        <button 
          className="photo-overlay-close"
          onClick={onClose}
          aria-label="关闭"
        />
        
        {images.length > 1 && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-32 opacity-0 hover:opacity-100 transition-opacity z-20"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              style={{
                background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 512 512\'%3E%3Cpath fill=\'%23fff\' d=\'M256 504C119 504 8 393 8 256S119 8 256 8s248 111 248 248-111 248-248 248zM142.1 273l135.5 135.5c9.4 9.4 24.6 9.4 33.9 0l17-17c9.4-9.4 9.4-24.6 0-33.9L226.9 256l101.6-101.6c9.4-9.4 9.4-24.6 0-33.9l-17-17c-9.4-9.4-24.6-9.4-33.9 0L142.1 239c-9.4 9.4-9.4 24.6 0 34z\'/%3E%3C/svg%3E") center/5em no-repeat',
              }}
              aria-label="上一张"
            />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-32 opacity-0 hover:opacity-100 transition-opacity z-20"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              style={{
                background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 512 512\'%3E%3Cpath fill=\'%23fff\' d=\'M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm113.9 231L234.4 103.5c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6 0 33.9L285.1 256 183.5 357.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0L369.9 273c9.4-9.4 9.4-24.6 0-34z\'/%3E%3C/svg%3E") center/5em no-repeat',
              }}
              aria-label="下一张"
            />
          </>
        )}
        
        <img 
          src={currentImage} 
          alt={post.title}
          className="max-h-[80vh] object-contain"
        />
        
        <div className="photo-caption">
          <h2>{post.title}</h2>
          
          {post.content && (
            <p className="text-sm opacity-80">{post.excerpt}</p>
          )}
          
          <div className="tag-info-bottom mt-2">
            {post.device && (
              <span>
                <i className="iconfont icon-camera-lens-line"></i>
                {post.device}
              </span>
            )}
            {post.location && (
              <span>
                <i className="iconfont icon-map-pin-2-line"></i>
                {post.location}
              </span>
            )}
            <span>
              <i className="iconfont icon-time-line"></i>
              {formatDate(post.date)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <span className="tag-categorys">
              <span>{post.category}</span>
            </span>
            {post.tags.length > 0 && (
              <span className="tag-list flex gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-white/80">#{tag}</span>
                ))}
              </span>
            )}
          </div>
          
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
