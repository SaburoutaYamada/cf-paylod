import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import '../styles.css'

export default async function PostsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // 公開済みのブログ投稿をすべて取得
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedDate',
  })

  return (
    <div className="home">
      <header className="header">
        <div className="header-content">
          <h1>
            <Link href="/">Payload CMS Blog</Link>
          </h1>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/posts">All Posts</Link>
            {user ? (
              <Link href="/admin">Admin Panel</Link>
            ) : (
              <Link href="/admin">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="posts-section">
          <h2>All Posts</h2>
          {posts.length === 0 ? (
            <div className="empty-state">
              <p>No posts yet. Create your first post in the admin panel!</p>
              <Link href="/admin" className="button">
                Go to Admin Panel
              </Link>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => {
                const featuredImage =
                  typeof post.featuredImage === 'object' && post.featuredImage
                    ? post.featuredImage
                    : null

                return (
                  <article key={post.id} className="post-card">
                    {featuredImage && (
                      <div className="post-image">
                        <Image
                          src={featuredImage.url || ''}
                          alt={featuredImage.alt || post.title}
                          width={400}
                          height={250}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="post-content">
                      <h3>
                        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                      </h3>
                      {post.excerpt && <p className="excerpt">{post.excerpt}</p>}
                      <div className="post-meta">
                        {post.publishedDate && (
                          <time>
                            {new Date(post.publishedDate).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        )}
                        {post.category && typeof post.category === 'object' && (
                          <span className="category">
                            {post.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Built with Payload CMS & Cloudflare Workers</p>
      </footer>
    </div>
  )
}
