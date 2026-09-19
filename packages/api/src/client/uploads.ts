import { useAuthStore } from '../stores/authStore'

const API_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ?? ''

const UPLOAD_ERROR_MESSAGES: Record<number, string> = {
  400: 'Seleccioná una imagen para subir.',
  403: 'No tenés permisos para subir imágenes.',
  413: 'La imagen supera el tamaño máximo permitido.',
  415: 'Formato no permitido. Usá JPG, PNG, WEBP o GIF.',
  502: 'No se pudo subir la imagen. Intentá de nuevo en unos minutos.',
}

interface UploadResponse {
  url?: string
  message?: string
}

export const uploadProductImage = async (file: File): Promise<string> => {
  const token = useAuthStore.getState().accessToken
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/v1/uploads`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const payload = (await response.json().catch(() => null)) as UploadResponse | null

  if (!response.ok) {
    throw new Error(
      UPLOAD_ERROR_MESSAGES[response.status] ?? payload?.message ?? 'No se pudo subir la imagen.',
    )
  }

  if (!payload?.url) {
    throw new Error('La respuesta de la subida no incluyó una URL.')
  }

  return payload.url
}
