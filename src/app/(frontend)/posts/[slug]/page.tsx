import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import '../../styles.css'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: params.slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
  })

  const post = docs[0]

  if (!post) {
    notFound()
  }

  const featuredImage =
    typeof post.featuredImage === 'object' && post.featuredImage
      ? post.featuredImage
      : null

  const author =
    typeof post.author === 'object' && post.author ? post.author : null

  // Lexicalコンテンツをシリアライズ（簡易版）
  const content = post.content
    ? JSON.stringify(post.content)
    : ''

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
        <article className="post-detail">
          <header className="post-header">
            <h1>{post.title}</h1>
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
              {author && (
                <span className="author">By {author.email}</span>
              )}
              {post.category && typeof post.category === 'object' && (
                <span className="category">
                  {post.category.name}
                </span>
              )}
            </div>
          </header>

          {featuredImage && (
            <div className="post-featured-image">
              <Image
                src={featuredImage.url || ''}
                alt={featuredImage.alt || post.title}
                width={1200}
                height={600}
                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              />
            </div>
          )}

          {post.excerpt && (
            <div className="post-excerpt">
              <p>{post.excerpt}</p>
            </div>
          )}

          <div className="post-content-wrapper">
            {content && (
              <div
                className="post-content"
                dangerouslySetInnerHTML={{
                  __html: `<p>Content preview: Use the admin panel to view full rich text content.</p>`,
                }}
              />
            )}
          </div>

          <div className="post-footer">
            <Link href="/posts" className="button">
              ← Back to All Posts
            </Link>
          </div>
        </article>
      </main>

      <footer className="footer">
        <p>Built with Payload CMS & Cloudflare Workers</p>
      </footer>
    </div>
  )
}
