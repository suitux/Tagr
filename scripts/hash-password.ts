#!/usr/bin/env node
import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: pnpm hash-password <password>')
  process.exit(1)
}

bcrypt.hash(password, 12).then(hash => {
  const hashWithoutSpecials = hash.replace(/\$/g, '\\$')

  console.log('\nGenerated hash for AUTH_PASSWORD:')
  console.log(hashWithoutSpecials)
  console.log('\nAdd this to your .env file:')
  console.log(`AUTH_PASSWORD="${hashWithoutSpecials}"`)
})
