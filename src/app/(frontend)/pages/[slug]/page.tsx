import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import '../../styles.css'

export default async function PageDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
  })

  const page = docs[0]

  if (!page) {
    notFound()
  }

  const featuredImage =
    typeof page.featuredImage === 'object' && page.featuredImage
      ? page.featuredImage
      : null

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
        <article className="page-detail">
          <header className="page-header">
            <h1>{page.title}</h1>
          </header>

          {featuredImage && (
            <div className="page-featured-image">
              <Image
                src={featuredImage.url || ''}
                alt={featuredImage.alt || page.title}
                width={1200}
                height={600}
                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              />
            </div>
          )}

          <div className="page-content-wrapper">
            <div
              className="page-content"
              dangerouslySetInnerHTML={{
                __html: `<p>Content preview: Use the admin panel to view full rich text content.</p>`,
              }}
            />
          </div>
        </article>
      </main>

      <footer className="footer">
        <p>Built with Payload CMS & Cloudflare Workers</p>
      </footer>
    </div>
  )
}
