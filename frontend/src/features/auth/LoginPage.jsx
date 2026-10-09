import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { getErrorMessage } from '../../lib/errors'
import { useLoginMutation } from '../../services/api'
import AuthLayout from './AuthLayout'
import { selectIsAuthenticated } from './authSlice'

export default function LoginPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()
  const [login, { isLoading, error }] = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: '', password: '' } })

  if (isAuthenticated) return <Navigate to={location.state?.from ?? '/'} replace />

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your price alerts."
      footer={
        <>
          New to Tickr?{' '}
          <Link to="/register" className="text-lime font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => login(values))}
        noValidate
        className="space-y-5"
      >
        <Alert>{error && getErrorMessage(error, 'Unable to sign in.')}</Alert>
        <Field
          label="Username"
          autoComplete="username"
          autoFocus
          error={errors.username?.message}
          {...register('username', { required: 'Enter your username.' })}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Enter your password.' })}
        />
        <Button type="submit" size="lg" loading={isLoading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
