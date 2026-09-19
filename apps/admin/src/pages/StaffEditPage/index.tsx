import { useEffect, useMemo } from 'react'
import { Box, HStack } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import {
  EditPageShell,
  FormActions,
  FormField,
  FormLayout,
  FormPasswordField,
  FormSelectField,
  type SelectFieldOption,
} from '@repo/components'
import { useBranches, useStaff } from '@repo/api'
import {
  optionsFromEntities,
  ROLE_OPTIONS,
  staffCreateSchema,
  staffUpdateSchema,
  type StaffInput,
  type StaffMember,
} from '@repo/domain'
import { routes } from '../../routes'

type StaffRole = 'branch_admin' | 'super_admin'

const StaffCommonFields = ({
  branchOptions,
  editing = false,
}: {
  branchOptions: SelectFieldOption[]
  editing?: boolean
}) => {
  const { watch } = useFormContext()
  const role = watch('role') as string

  return (
    <>
      <HStack gap="4" align="start">
        <Box flex="1">
          <FormField name="firstName" label="Nombre" required />
        </Box>
        <Box flex="1">
          <FormField name="lastName" label="Apellido" required />
        </Box>
      </HStack>
      <FormField name="email" label="Correo electrónico" required type="email" disabled={editing} />
      <FormField name="phone" label="Teléfono" required />
      <FormSelectField
        name="role"
        label="Rol"
        required
        options={ROLE_OPTIONS}
        placeholder="Seleccionar rol..."
        disabled={editing}
      />
      {role === 'branch_admin' ? (
        <FormSelectField
          name="branchId"
          label="Sucursal"
          required
          options={branchOptions}
          placeholder="Seleccionar sucursal..."
        />
      ) : null}
    </>
  )
}

interface CreateStaffFormProps {
  branchOptions: SelectFieldOption[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (input: StaffInput) => Promise<void>
}

const CreateStaffForm = ({
  branchOptions,
  isSubmitting,
  onCancel,
  onSubmit,
}: CreateStaffFormProps) => {
  const form = useForm<z.input<typeof staffCreateSchema>>({
    resolver: zodResolver(staffCreateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      branchId: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: StaffInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      password: values.password,
      role: values.role as StaffRole,
      branchId: values.branchId || undefined,
    }
    await onSubmit(input)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <FormLayout>
          <StaffCommonFields branchOptions={branchOptions} />
          <FormPasswordField name="password" label="Contraseña inicial" required />
          <FormActions
            onCancel={onCancel}
            submitLabel="Crear colaborador"
            isSubmitting={isSubmitting}
          />
        </FormLayout>
      </form>
    </FormProvider>
  )
}

interface EditStaffFormProps {
  member: StaffMember
  branchOptions: SelectFieldOption[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (input: Omit<StaffInput, 'password' | 'email' | 'role'>) => Promise<void>
}

const EditStaffForm = ({
  member,
  branchOptions,
  isSubmitting,
  onCancel,
  onSubmit,
}: EditStaffFormProps) => {
  const form = useForm<z.input<typeof staffUpdateSchema>>({
    resolver: zodResolver(staffUpdateSchema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      branchId: member.branchId != null ? String(member.branchId) : '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    form.reset({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      branchId: member.branchId != null ? String(member.branchId) : '',
    })
  }, [member, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: Omit<StaffInput, 'password' | 'email' | 'role'> = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      branchId: values.branchId || undefined,
    }
    await onSubmit(input)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <FormLayout>
          <StaffCommonFields branchOptions={branchOptions} editing />
          <FormActions onCancel={onCancel} submitLabel="Guardar" isSubmitting={isSubmitting} />
        </FormLayout>
      </form>
    </FormProvider>
  )
}

export const StaffEditPage = () => {
  const { userId } = useParams()
  const isNew = userId == null
  const navigate = useNavigate()

  const { staff, isLoading, isMutating, create, update } = useStaff()
  const { branches } = useBranches()
  const member = userId ? staff.find((s) => s.id === userId) : undefined

  const branchOptions = useMemo(() => optionsFromEntities(branches), [branches])

  return (
    <EditPageShell
      isNew={isNew}
      isLoading={isLoading}
      hasEntity={member != null}
      title={isNew ? 'Nuevo colaborador' : `${member?.firstName} ${member?.lastName}`}
      loadingTitle="Personal"
      notFound={{
        title: 'Usuario no encontrado',
        description: 'El usuario que buscás no existe.',
      }}
      blocked={{
        when: !isNew && member?.role === 'super_admin',
        title: 'Admin global no editable',
        description: 'Los admin globales no se pueden editar ni desactivar.',
      }}
    >
      {isNew ? (
        <CreateStaffForm
          branchOptions={branchOptions}
          isSubmitting={isMutating}
          onCancel={() => navigate(routes.staff)}
          onSubmit={async (input) => {
            await create(input)
            navigate(routes.staff)
          }}
        />
      ) : member ? (
        <EditStaffForm
          member={member}
          branchOptions={branchOptions}
          isSubmitting={isMutating}
          onCancel={() => navigate(routes.staff)}
          onSubmit={async (input) => {
            await update(member.id, input)
            navigate(routes.staff)
          }}
        />
      ) : null}
    </EditPageShell>
  )
}
