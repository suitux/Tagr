'use client'

import { EyeIcon, EyeOffIcon, KeyRoundIcon } from 'lucide-react'
import * as React from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group'

function PasswordInput(props: React.ComponentProps<typeof InputGroupInput>) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <InputGroup>
      <InputGroupAddon align='inline-start'>
        <InputGroupText>
          <KeyRoundIcon />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput type={showPassword ? 'text' : 'password'} {...props} />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton size='icon-xs' tabIndex={-1} onClick={() => setShowPassword(v => !v)}>
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
