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
      <div id="wrapper">
        <div id="main" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ color: '#fff', fontSize: '1.5em' }}>加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div id="wrapper" className={isPreload ? 'is-preload' : ''}>
      <Header config={blogIndex?.config} onAboutClick={handleAboutClick} />
      
      <main id="main">
        {blogIndex?.posts.map((post, index) => (
          <article
            key={post.slug}
            className="thumb"
            onClick={() => handlePhotoClick(post)}
          >
            {post.firstImage && (
              <img
                className="image"
                src={post.firstImage}
                alt={post.title}
                loading="lazy"
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  cursor: 'pointer'
                }}
              />
            )}
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
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
