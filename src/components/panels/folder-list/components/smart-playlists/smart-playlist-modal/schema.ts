import { z } from 'zod/v4'
import { operatorNeedsValue, type SmartPlaylistOperator } from '@/features/smart-playlists/domain'

export const smartPlaylistRuleSchema = z.object({
  field: z.string().min(1),
  operator: z.string().min(1),
  value: z.string()
})

export const smartPlaylistFormSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean(),
  match: z.enum(['all', 'any']),
  rules: z
    .array(smartPlaylistRuleSchema)
    .min(1)
    .superRefine((rules, ctx) => {
      rules.forEach((rule, i) => {
        if (operatorNeedsValue(rule.operator as SmartPlaylistOperator) && rule.value.trim().length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: [i, 'value'],
            message: 'Value is required'
          })
        }
      })
    })
})

export type SmartPlaylistFormData = z.infer<typeof smartPlaylistFormSchema>
