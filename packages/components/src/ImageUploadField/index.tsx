import { useState } from 'react'
import { Box, FileUpload, HStack, Image, Input, Spinner, VStack } from '@chakra-ui/react'
import CloudArrowUpIn from '@gravity-ui/icons/CloudArrowUpIn'
import Picture from '@gravity-ui/icons/Picture'
import Xmark from '@gravity-ui/icons/Xmark'
import { fieldInputProps } from '../FieldShell/fieldInputProps'
import { FieldShell } from '../FieldShell'
import { GhostButton } from '../Button'
import { Muted, Strong } from '../typography'
import type { ImageUploadFieldProps } from './types'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const EMPTY_FILES: File[] = []

export const ImageUploadField = ({
  label,
  required,
  invalid,
  errorText,
  value,
  onChange,
  onUpload,
  isUploading = false,
}: ImageUploadFieldProps) => {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const currentValue = value?.trim() ?? ''
  const hasImage = currentValue.length > 0

  const handleFiles = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setUploadError(null)
    try {
      const url = await onUpload(file)
      if (url) onChange?.(url)
      else setUploadError('No se pudo subir la imagen.')
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'No se pudo subir la imagen.')
    }
  }

  const clear = () => {
    setUploadError(null)
    onChange?.('')
  }

  return (
    <FieldShell
      label={label}
      required={required}
      invalid={invalid || uploadError != null}
      errorText={errorText ?? uploadError ?? undefined}
    >
      <VStack align="stretch" gap="3">
        <FileUpload.Root
          accept={ACCEPT}
          maxFiles={1}
          acceptedFiles={EMPTY_FILES}
          onFileChange={(details) => void handleFiles(details.acceptedFiles)}
        >
          <FileUpload.HiddenInput />
          <Box
            position="relative"
            borderRadius="xl"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="border.emphasized"
            bg="bg.subtle"
            overflow="hidden"
            aspectRatio="4 / 3"
            transition="border-color 150ms"
            _hover={{ borderColor: 'brand.500' }}
            _focusWithin={{ borderColor: 'brand.500' }}
          >
            <FileUpload.Dropzone
              border="none"
              width="full"
              height="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              {hasImage ? (
                <Image
                  src={currentValue}
                  alt={label}
                  width="full"
                  height="full"
                  objectFit="cover"
                />
              ) : (
                <VStack gap="2" padding="6" textAlign="center">
                  <Box color="brand.600">
                    <CloudArrowUpIn width={32} height={32} />
                  </Box>
                  <Strong fontSize="sm">Subir imagen</Strong>
                  <Muted fontSize="xs">Arrastrá y soltá o elegí JPG, PNG, WEBP o GIF</Muted>
                </VStack>
              )}
            </FileUpload.Dropzone>

            {isUploading ? (
              <Box
                position="absolute"
                inset="0"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="blackAlpha.600"
              >
                <Spinner color="white" />
              </Box>
            ) : null}
          </Box>

          <HStack justify="space-between" gap="2" marginTop="3">
            <FileUpload.Trigger asChild>
              <GhostButton size="sm" disabled={isUploading}>
                <Picture width={16} height={16} />
                {hasImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </GhostButton>
            </FileUpload.Trigger>
            {hasImage ? (
              <GhostButton size="sm" color="danger" onClick={clear} disabled={isUploading}>
                <Xmark width={16} height={16} />
                Quitar
              </GhostButton>
            ) : null}
          </HStack>
        </FileUpload.Root>

        <Input
          {...fieldInputProps}
          value={currentValue}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="o pegá una URL de imagen (https://...)"
          aria-label="URL de imagen"
        />
      </VStack>
    </FieldShell>
  )
}
