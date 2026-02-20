import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { Categories } from './collections/Categories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isProduction = process.env.NODE_ENV === 'production'

// Cloudflare Workers / サーバーレス環境では fs が使えないか読み取り専用のため、
// fs を使わずに CLI 判定。本番では常に getCloudflareContext を使用する。
function getIsCLI(): boolean {
  // payload migrate などのCLIコマンドを実行している場合を検出
  const isMigrateCommand = process.argv.some((arg) => arg.includes('migrate'))
  if (isMigrateCommand) return true
  
  if (isProduction) return false
  try {
    const fs = require('fs') as typeof import('fs')
    const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)
    return process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')) ?? false)
  } catch {
    return false
  }
}
const isCLI = getIsCLI()

// ビルド時（migrate実行時）は wrangler を使用してリモートD1に接続
// ランタイム（Workers実行時）は getCloudflareContext を使用
const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
      // 本番環境では既存のimportMap.jsを使用し、自動生成を防ぐ
      importMapFile: isProduction
        ? path.resolve(dirname, 'app', '(payload)', 'admin', 'importMap.js')
        : undefined,
    },
  },
  collections: [Users, Media, Posts, Pages, Categories],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // 本番（Cloudflare Workers）ではファイルシステムに書き込めないため outputFile を渡さない
  typescript: isProduction
    ? {}
    : { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
