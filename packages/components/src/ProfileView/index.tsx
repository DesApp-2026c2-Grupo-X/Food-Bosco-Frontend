import { Badge, VStack } from '@chakra-ui/react'
import { ROLE_LABELS } from '@repo/domain'
import { Card } from '../Card'
import { DetailRow } from '../DetailRow'
import { PageContainer } from '../PageContainer'
import { PageHeader } from '../PageHeader'
import { Strong } from '../Strong'
import type { ProfileViewProps } from './types'

export const ProfileView = ({ user, description }: ProfileViewProps) => (
  <PageContainer>
    <PageHeader title="Mi perfil" description={description} />

    <Card>
      <VStack align="start" gap="2">
        <Strong fontSize="lg">
          {user.firstName} {user.lastName}
        </Strong>
        <Badge colorPalette="brand">{ROLE_LABELS[user.role] ?? user.role}</Badge>
      </VStack>
      <VStack align="stretch" gap="3" marginTop="4">
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Teléfono" value={user.phone} />
      </VStack>
    </Card>
  </PageContainer>
)
