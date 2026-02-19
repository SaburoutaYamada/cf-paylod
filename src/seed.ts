import { getPayload } from 'payload'
import config from './payload.config'

/**
 * サンプルデータをシードする関数
 * 開発環境でのみ実行することを推奨します
 */
export async function seed() {
  const payload = await getPayload({ config })

  try {
    // カテゴリーを作成
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Technology related posts' },
      { name: 'Design', slug: 'design', description: 'Design related posts' },
      { name: 'Development', slug: 'development', description: 'Development related posts' },
    ]

    const createdCategories = []
    for (const categoryData of categories) {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: categoryData.slug } },
        limit: 1,
      })

      if (existing.totalDocs === 0) {
        const category = await payload.create({
          collection: 'categories',
          data: categoryData,
        })
        createdCategories.push(category)
        console.log(`✓ Created category: ${categoryData.name}`)
      } else {
        createdCategories.push(existing.docs[0])
        console.log(`- Category already exists: ${categoryData.name}`)
      }
    }

    // ユーザーを取得または作成
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    })

    let author = users.docs[0]
    if (!author) {
      console.log('⚠ No users found. Please create a user first in the admin panel.')
      return
    }

    // サンプル投稿を作成
    const posts = [
      {
        title: 'Welcome to Payload CMS',
        slug: 'welcome-to-payload-cms',
        excerpt: 'Learn how to get started with Payload CMS and build powerful content management systems.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Payload CMS is a powerful, flexible headless CMS built with TypeScript. It provides a great developer experience and powerful features out of the box.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        author: author.id,
        category: createdCategories[0]?.id,
        status: 'published',
        publishedDate: new Date().toISOString(),
      },
      {
        title: 'Building Modern Websites with Next.js',
        slug: 'building-modern-websites-with-nextjs',
        excerpt: 'Discover how to build fast, modern websites using Next.js and Payload CMS.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Next.js is a powerful React framework that makes it easy to build production-ready web applications. Combined with Payload CMS, you can create amazing content-driven websites.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        author: author.id,
        category: createdCategories[2]?.id,
        status: 'published',
        publishedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        title: 'Getting Started with Cloudflare Workers',
        slug: 'getting-started-with-cloudflare-workers',
        excerpt: 'Learn how to deploy your Payload CMS application to Cloudflare Workers.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Cloudflare Workers provides a serverless platform for running your applications at the edge. This template demonstrates how to run Payload CMS on Cloudflare Workers with D1 database.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        author: author.id,
        category: createdCategories[0]?.id,
        status: 'published',
        publishedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ]

    for (const postData of posts) {
      const existing = await payload.find({
        collection: 'posts',
        where: { slug: { equals: postData.slug } },
        limit: 1,
      })

      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'posts',
          data: postData,
        })
        console.log(`✓ Created post: ${postData.title}`)
      } else {
        console.log(`- Post already exists: ${postData.title}`)
      }
    }

    // サンプル固定ページを作成
    const pages = [
      {
        title: 'About',
        slug: 'about',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'This is a sample about page created with Payload CMS. You can edit this content in the admin panel.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        status: 'published',
      },
    ]

    for (const pageData of pages) {
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: pageData.slug } },
        limit: 1,
      })

      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'pages',
          data: pageData,
        })
        console.log(`✓ Created page: ${pageData.title}`)
      } else {
        console.log(`- Page already exists: ${pageData.title}`)
      }
    }

    console.log('\n✅ Sample data seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  }
}

// CLIから実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
