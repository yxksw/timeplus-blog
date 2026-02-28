'use client'

import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useEffect, useCallback } from 'react'
import { Camera, MapPin, Calendar } from 'lucide-react'

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
    <div className="poptrox-overlay" onClick={onClose}>
      <div 
        className="poptrox-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="closer"
          onClick={onClose}
          aria-label="关闭"
        />
        
        {images.length > 1 && (
          <>
            <button
              className="nav-previous"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              aria-label="上一张"
            />
            <button
              className="nav-next"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              aria-label="下一张"
            />
          </>
        )}
        
        <div className="pic">
          <img 
            src={currentImage} 
            alt={post.title}
          />
        </div>
        
        <div className="caption">
          <h2>{post.title}</h2>
          
          {post.content && (
            <p>{post.excerpt}</p>
          )}
          
          <div className="tag-info-bottom">
            {post.device && (
              <span>
                <Camera size={14} />
                {post.device}
              </span>
            )}
            {post.location && (
              <span>
                <MapPin size={14} />
                {post.location}
              </span>
            )}
            <span>
              <Calendar size={14} />
              {formatDate(post.date)}
            </span>
          </div>
          
          <div className="content-wrapper">
            <span className="tag-categorys">
              <span>{post.category}</span>
            </span>
            {post.tags.length > 0 && (
              <span className="tag-list">
                {post.tags.map((tag) => (
                  <a key={tag} href={`#${tag}`}>#{tag}</a>
                ))}
              </span>
            )}
          </div>
          
          {images.length > 1 && (
            <nav className="breadcrumb-nav">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`nav-dot ${index === imageIndex ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onImageSelect(index); }}
                  aria-label={`图片 ${index + 1}`}
                />
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
