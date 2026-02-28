'use client'

import { useState, useEffect, useCallback } from 'react'
import { BlogPost, BlogIndex } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PhotoOverlay from '@/components/PhotoOverlay'
import EditButton from '@/components/EditButton'

export default function Home() {
  const [blogIndex, setBlogIndex] = useState<BlogIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isPreload, setIsPreload] = useState(true)
  const [showFooter, setShowFooter] = useState(false)

  useEffect(() => {
    loadBlogIndex()
    const timer = setTimeout(() => setIsPreload(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const loadBlogIndex = async () => {
    try {
      const res = await fetch('/api/blog')
      if (res.ok) {
        const data = await res.json()
        setBlogIndex(data)
      }
    } catch (error) {
      console.error('Failed to load blog index:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoClick = useCallback((post: BlogPost) => {
    setSelectedPost(post)
    setSelectedImageIndex(0)
  }, [])

  const handleCloseOverlay = useCallback(() => {
    setSelectedPost(null)
    setSelectedImageIndex(0)
  }, [])

  const handlePrevImage = useCallback(() => {
    if (selectedPost && selectedPost.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? selectedPost.images.length - 1 : prev - 1
      )
    }
  }, [selectedPost])

  const handleNextImage = useCallback(() => {
    if (selectedPost && selectedPost.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === selectedPost.images.length - 1 ? 0 : prev + 1
      )
    }
  }, [selectedPost])

  const handleAboutClick = useCallback(() => {
    setShowFooter((prev) => !prev)
  }, [])

  const handleCloseFooter = useCallback(() => {
    setShowFooter(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#242629]">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isPreload ? 'is-preload' : ''}`}>
      <Header config={blogIndex?.config} onAboutClick={handleAboutClick} />
      
      <main className="photo-grid pb-20">
        {blogIndex?.posts.map((post, index) => (
          <article
            key={post.slug}
            className="photo-item"
            style={{
              width: '25%',
              height: 'calc(40vh - 2em)',
              minHeight: '20em',
              transitionDelay: `${0.65 + index * 0.15}s`,
            }}
            onClick={() => handlePhotoClick(post)}
          >
            {post.firstImage && (
              <img
                src={post.firstImage}
                alt={post.title}
                loading="lazy"
              />
            )}
            <h2>{post.title}</h2>
            <div className="tag-info">
              <span className="tag-categorys">
                <span>{post.category}</span>
              </span>
            </div>
          </article>
        ))}
      </main>

      {selectedPost && (
        <PhotoOverlay
          post={selectedPost}
          imageIndex={selectedImageIndex}
          images={selectedPost.images}
          onClose={handleCloseOverlay}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          onImageSelect={setSelectedImageIndex}
        />
      )}

      <Footer config={blogIndex?.config} isVisible={showFooter} onClose={handleCloseFooter} />
      
      <EditButton />
    </div>
  )
}
