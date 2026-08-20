import { useMemo } from 'react'
import { Box, HStack } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BackButton,
  EmptyState,
  FormField,
  FormLayout,
  FormPasswordField,
  GhostButton,
  PageTitle,
  PrimaryButton,
  type SelectFieldOption,
  WidePageContainer,
} from '@repo/components'
import { useBranches, useStaff } from '@repo/api'
import {
  staffCreateSchema,
  staffUpdateSchema,
  type StaffCreateForm,
  type StaffInput,
  type StaffMember,
  type StaffUpdateForm,
} from '@repo/domain'
import { FormSelectField } from '../../components/FormSelectField'
import { routes } from '../../routes'

const ROLE_OPTIONS: SelectFieldOption[] = [
  { value: 'branch_admin', label: 'Colaborador de sucursal' },
  { value: 'super_admin', label: 'Admin global' },
]

type StaffRole = 'branch_admin' | 'super_admin'

const StaffCommonFields = ({ branchOptions }: { branchOptions: SelectFieldOption[] }) => {
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
      <FormField name="email" label="Correo electrónico" required type="email" />
      <FormField name="phone" label="Teléfono" required />
      <FormSelectField
        name="role"
        label="Rol"
        required
        options={ROLE_OPTIONS}
        placeholder="Seleccionar rol..."
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
  const form = useForm<StaffCreateForm>({
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
      branchId: values.branchId ? Number(values.branchId) : undefined,
    }
    await onSubmit(input)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <FormLayout>
          <StaffCommonFields branchOptions={branchOptions} />
          <FormPasswordField name="password" label="Contraseña inicial" required />
          <HStack justify="end" gap="2">
            <GhostButton type="button" onClick={onCancel}>
              Cancelar
            </GhostButton>
            <PrimaryButton
              type="submit"
              size="md"
              disabled={!form.formState.isValid || isSubmitting}
              loading={isSubmitting}
            >
              Crear colaborador
            </PrimaryButton>
          </HStack>
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
  onSubmit: (input: Omit<StaffInput, 'password'>) => Promise<void>
}

const EditStaffForm = ({
  member,
  branchOptions,
  isSubmitting,
  onCancel,
  onSubmit,
}: EditStaffFormProps) => {
  const form = useForm<StaffUpdateForm>({
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

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: Omit<StaffInput, 'password'> = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role: values.role as StaffRole,
      branchId: values.branchId ? Number(values.branchId) : undefined,
    }
    await onSubmit(input)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <FormLayout>
          <StaffCommonFields branchOptions={branchOptions} />
          <HStack justify="end" gap="2">
            <GhostButton type="button" onClick={onCancel}>
              Cancelar
            </GhostButton>
            <PrimaryButton
              type="submit"
              size="md"
              disabled={!form.formState.isValid || isSubmitting}
              loading={isSubmitting}
            >
              Guardar
            </PrimaryButton>
          </HStack>
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

  const branchOptions = useMemo(
    () => branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
    [branches],
  )

  if (!isNew && isLoading) {
    return (
      <WidePageContainer>
        <BackButton />
        <PageTitle>Personal</PageTitle>
      </WidePageContainer>
    )
  }

  if (!isNew && !member) {
    return (
      <WidePageContainer>
        <BackButton />
        <EmptyState title="Usuario no encontrado" description="El usuario que buscás no existe." />
      </WidePageContainer>
    )
  }

  return (
    <WidePageContainer>
      <BackButton />
      <Box>
        <PageTitle>
          {isNew ? 'Nuevo colaborador' : `${member?.firstName} ${member?.lastName}`}
        </PageTitle>
      </Box>

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
    </WidePageContainer>
  )
}
