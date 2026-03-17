export interface ShareLink {
  token: string
  expiresAt: string
}

export interface ShareExpirationOption {
  labelKey: string
  seconds: number
}

export const SHARE_EXPIRATION_OPTIONS: ShareExpirationOption[] = [
  { labelKey: 'fiveMinutes', seconds: 300 },
  { labelKey: 'fifteenMinutes', seconds: 900 },
  { labelKey: 'oneHour', seconds: 3600 },
  { labelKey: 'sixHours', seconds: 21600 },
  { labelKey: 'twentyFourHours', seconds: 86400 },
  { labelKey: 'sevenDays', seconds: 604800 },
  { labelKey: 'thirtyDays', seconds: 2_592_000 }
]
