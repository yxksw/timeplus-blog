'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BlogPost, BlogIndex } from '@/types/blog'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PhotoOverlay from '@/components/PhotoOverlay'
import EditButton from '@/components/EditButton'

// 内部组件，使用 useSearchParams
function HomeContent() {
  const [blogIndex, setBlogIndex] = useState<BlogIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isPreload, setIsPreload] = useState(true)
  const [showFooter, setShowFooter] = useState(false)
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category')

  useEffect(() => {
    loadBlogIndex()
    const timer = setTimeout(() => setIsPreload(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // 当灯箱打开时隐藏底部导航栏
  useEffect(() => {
    if (selectedPost) {
      document.body.classList.add('modal-active')
    } else {
      document.body.classList.remove('modal-active')
    }
    
    return () => {
      document.body.classList.remove('modal-active')
    }
  }, [selectedPost])

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

  // 根据分类筛选文章
  const filteredPosts = useMemo(() => {
    if (!blogIndex?.posts) return []
    if (!categoryFilter) return blogIndex.posts
    return blogIndex.posts.filter(post => post.category === categoryFilter)
  }, [blogIndex?.posts, categoryFilter])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#242629]">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isPreload ? 'is-preload' : ''} ${selectedPost ? 'modal-active' : ''}`}>
      <Header config={blogIndex?.config} onAboutClick={handleAboutClick} isHidden={!!selectedPost} />
      
      <main className="photo-grid pb-20">
        {categoryFilter && (
          <div className="w-full px-4 md:px-8 py-4 flex items-center gap-2 text-[#a0a0a1]">
            <span>分类：</span>
            <span className="text-white font-medium">{categoryFilter}</span>
            <a 
              href="/" 
              className="ml-4 text-sm hover:text-white underline"
            >
              清除筛选
            </a>
          </div>
        )}
        {filteredPosts.map((post, index) => (
          <article
            key={post.slug}
            className="photo-item"
            style={{
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
        {filteredPosts.length === 0 && categoryFilter && (
          <div className="w-full flex flex-col items-center justify-center py-20 text-[#a0a0a1]">
            <p className="text-xl mb-4">该分类下暂无文章</p>
            <a href="/" className="hover:text-white underline">
              查看全部文章
            </a>
          </div>
        )}
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

// 加载状态组件
function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#242629]">
      <div className="text-white text-xl">加载中...</div>
    </div>
  )
}

// 主页面组件
export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  )
}
