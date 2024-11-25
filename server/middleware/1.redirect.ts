import type { z } from 'zod'
import { parsePath, withQuery } from 'ufo'
import type { LinkSchema } from '@/schemas/link'

export default eventHandler(async (event) => {
  const { pathname: slug } = parsePath(event.path.replace(/^\/|\/$/g, '')) // remove leading and trailing slashes
  const { slugRegex, reserveSlug } = useAppConfig(event)
  const { homeURL, linkCacheTtl, redirectWithQuery, notFoundRedirectUrl } = useRuntimeConfig(event)
  const { cloudflare } = event.context

  if (event.path === '/' && homeURL)
    return sendRedirect(event, homeURL)

  // 只处理非保留的slug
  if (slug && !reserveSlug.includes(slug)) {
    // 如果是合法的slug格式且有cloudflare环境
    if (slugRegex.test(slug) && cloudflare) {
      const { KV } = cloudflare.env
      const link: z.infer<typeof LinkSchema> | null = await KV.get(`link:${slug}`, { type: 'json', cacheTtl: linkCacheTtl })
      if (link) {
        event.context.link = link
        try {
          await useAccessLog(event)
        }
        catch (error) {
          console.error('Failed write access log:', error)
        }
        const target = redirectWithQuery ? withQuery(link.url, getQuery(event)) : link.url
        return sendRedirect(event, target, +useRuntimeConfig(event).redirectStatusCode)
      }
    }
    
    // 处理以下情况的重定向：
    // 1. slug格式不合法
    // 2. slug不存在
    if (notFoundRedirectUrl) {
      return sendRedirect(event, notFoundRedirectUrl)
    }
  }
})
