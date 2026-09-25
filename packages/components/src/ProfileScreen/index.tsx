import { Box, Text } from '@chakra-ui/react'
import Logout from '@gravity-ui/icons/ArrowRightFromSquare'
import Moon from '@gravity-ui/icons/Moon'
import { Card } from '../Card'
import { ColorModeButton } from '../ColorModeProvider/ColorModeButton'
import { OutlineButton } from '../Button'
import { PageContainer } from '../PageContainer'
import { PageHeader } from '../PageHeader'
import { ProfileNav } from '../ProfileNav'
import type { ProfileScreenProps } from './types'

export const ProfileScreen = ({
  title,
  description,
  identity,
  appearance,
  beforeNav,
  navItems,
  navFallbackIcon,
  onLogout,
}: ProfileScreenProps) => (
  <PageContainer>
    <PageHeader title={title} description={description} />

    <Card variant="subtle" display="flex" alignItems="center" gap="4">
      {identity}
    </Card>

    {appearance ? (
      <Card
        padding="3.5"
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap="3">
          <Box color="brand.600" bg="bg.muted" borderRadius="full" padding="2" display="flex">
            <Moon width={18} height={18} />
          </Box>
          <Text fontWeight="medium">Apariencia</Text>
        </Box>
        <ColorModeButton />
      </Card>
    ) : null}

    {beforeNav}

    <ProfileNav items={navItems} fallbackIcon={navFallbackIcon} />

    <OutlineButton
      width="full"
      gap="2"
      color="danger"
      _hover={{ borderColor: 'danger', bg: 'bg.muted' }}
      onClick={onLogout}
    >
      <Logout width={18} height={18} />
      Cerrar sesión
    </OutlineButton>
  </PageContainer>
)
