import { Box, Tabs } from '@chakra-ui/react'
import type { EditPageTabsProps } from './types'

export const EditPageTabs = ({ defaultValue, tabs }: EditPageTabsProps) => (
  <Box marginTop="6">
    <Tabs.Root defaultValue={defaultValue} variant="line" colorPalette="brand">
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  </Box>
)
