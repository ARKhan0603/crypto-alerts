import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { getErrorMessage, getFieldErrors } from '../../lib/errors'
import { useLoginMutation, useRegisterMutation } from '../../services/api'
import AuthLayout from './AuthLayout'
import { selectIsAuthenticated } from './authSlice'

export default function RegisterPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [registerUser, { isLoading: registering, error }] = useRegisterMutation()
  const [login, { isLoading: signingIn, error: loginError }] = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: '', email: '', password: '' } })

  if (isAuthenticated) return <Navigate to="/" replace />

  // Server-side validation (taken username, weak password…) shows next to its field.
  const serverErrors = getFieldErrors(error)
  const hasFieldErrors = Object.keys(serverErrors).length > 0

  const onSubmit = async (values) => {
    const result = await registerUser(values)
    if (!result.error) login({ username: values.username, password: values.password })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking the prices that matter to you."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-lime font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Alert>
          {(error && !hasFieldErrors && getErrorMessage(error)) ||
            (loginError &&
              'Account created, but sign-in failed. Please sign in manually.')}
        </Alert>
        <Field
          label="Username"
          autoComplete="username"
          autoFocus
          error={errors.username?.message ?? serverErrors.username}
          {...register('username', { required: 'Choose a username.' })}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          hint="Used to send you alert notifications."
          error={errors.email?.message ?? serverErrors.email}
          {...register('email', {
            required: 'Enter your email.',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
          })}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message ?? serverErrors.password}
          {...register('password', {
            required: 'Choose a password.',
            minLength: { value: 8, message: 'Use at least 8 characters.' },
          })}
        />
        <Button
          type="submit"
          size="lg"
          loading={registering || signingIn}
          className="w-full"
        >
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
