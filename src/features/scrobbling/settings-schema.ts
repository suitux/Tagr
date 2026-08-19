import { z } from 'zod/v4'

export const scrobbleSettingsFormSchema = z.object({
  enabled: z.boolean(),
  /** Empty means "keep the token already stored". */
  token: z.string(),
  /** Empty means the provider default. */
  apiRoot: z.string().refine(value => !value || z.url().safeParse(value).success, {
    message: 'Must be a valid URL'
  })
})

export type ScrobbleSettingsFormData = z.infer<typeof scrobbleSettingsFormSchema>
