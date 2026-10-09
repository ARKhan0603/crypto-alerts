import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { getErrorMessage, getFieldErrors } from '../../lib/errors'
import { ALERT_TYPE_OPTIONS, ALERT_TYPES } from '../../lib/constants'
import { formatPrice } from '../../lib/format'
import { useCreateAlertMutation, useUpdateAlertMutation } from '../../services/api'
import { selectCoins } from '../prices/selectors'
import { editorClosed, selectEditor } from '../ui/uiSlice'
import { selectRawAlerts } from './selectors'

const PRICE_PATTERN = /^\d+(\.\d{1,8})?$/

const blankValues = (symbol) => ({
  symbol: symbol ?? '',
  alert_type: ALERT_TYPES.ABOVE,
  target_price: '',
  is_active: true,
})

/** Create / edit form. Mounted only while open so its state resets for each use. */
function AlertForm({ editor, onClose }) {
  const coins = useSelector(selectCoins)
  const existing = useSelector((state) =>
    editor.alertId === null
      ? null
      : selectRawAlerts(state).find((a) => a.id === editor.alertId),
  )
  const isEditing = Boolean(existing)

  const [createAlert, creating] = useCreateAlertMutation()
  const [updateAlert, updating] = useUpdateAlertMutation()
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: existing
      ? {
          symbol: existing.symbol,
          alert_type: existing.alert_type,
          target_price: String(Number(existing.target_price)),
          is_active: existing.is_active,
        }
      : blankValues(editor.symbol),
  })

  const symbol = useWatch({ control, name: 'symbol' })
  const alertType = useWatch({ control, name: 'alert_type' })
  const currentPrice = coins.find((c) => c.symbol === symbol)?.last_price
  const submitting = creating.isLoading || updating.isLoading

  const onSubmit = async (values) => {
    const body = { ...values, target_price: values.target_price.trim() }
    const result = isEditing
      ? await updateAlert({ id: existing.id, ...body })
      : await createAlert(body)

    if (!result.error) return onClose()

    // Map DRF validation errors back to their fields; anything else shows as a banner.
    for (const [field, message] of Object.entries(getFieldErrors(result.error))) {
      if (field in blankValues()) setError(field, { message })
    }
    return undefined
  }

  const serverError = (isEditing ? updating.error : creating.error) ?? null
  const bannerError =
    serverError &&
    !Object.keys(getFieldErrors(serverError)).some((f) => f in blankValues()) &&
    getErrorMessage(serverError)
  const nonFieldError = serverError?.data?.non_field_errors

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <Alert>{bannerError || (nonFieldError && nonFieldError.join(' '))}</Alert>

        <div>
          <label
            htmlFor="alert-symbol"
            className="text-ink-200 mb-1.5 block text-sm font-medium"
          >
            Cryptocurrency
          </label>
          <select
            id="alert-symbol"
            disabled={isEditing}
            aria-invalid={errors.symbol ? 'true' : undefined}
            className="border-ink-600 bg-ink-900 text-ink-100 focus:border-lime/70 focus:ring-lime/10 h-11 w-full rounded-xl border px-3 outline-none focus:ring-4 disabled:opacity-60"
            {...register('symbol', { required: 'Choose a cryptocurrency.' })}
          >
            <option value="">Select a coin…</option>
            {coins.map((coin) => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>
          {errors.symbol && (
            <p role="alert" className="text-down mt-1.5 text-sm">
              {errors.symbol.message}
            </p>
          )}
          {currentPrice && (
            <p className="text-ink-400 mt-1.5 text-sm">
              Current price{' '}
              <span className="text-ink-200 font-mono">{formatPrice(currentPrice)}</span>
            </p>
          )}
        </div>

        <fieldset>
          <legend className="text-ink-200 mb-1.5 text-sm font-medium">
            Notify me when price is
          </legend>
          <div className="bg-ink-900 grid grid-cols-2 gap-2 rounded-xl p-1">
            {ALERT_TYPE_OPTIONS.map(({ value, label, icon }) => (
              <label
                key={value}
                className={clsx(
                  'flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors',
                  'has-[:focus-visible]:outline-lime has-[:focus-visible]:outline-2',
                  alertType === value
                    ? value === ALERT_TYPES.ABOVE
                      ? 'bg-up/15 text-up'
                      : 'bg-down/15 text-down'
                    : 'text-ink-400 hover:text-ink-200',
                )}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('alert_type')}
                />
                <span aria-hidden="true">{icon}</span>
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label="Target price (USD)"
          prefix="$"
          inputMode="decimal"
          placeholder="0.00"
          autoComplete="off"
          error={errors.target_price?.message}
          {...register('target_price', {
            required: 'Enter a target price.',
            pattern: {
              value: PRICE_PATTERN,
              message: 'Use a positive number with up to 8 decimals.',
            },
            validate: (v) => Number(v) > 0 || 'Target price must be greater than 0.',
          })}
        />

        {isEditing && (
          <label className="border-ink-700 bg-ink-900 flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3">
            <span>
              <span className="block text-sm font-medium">Alert is active</span>
              <span className="text-ink-400 text-sm">
                Pause to stop watching without deleting.
              </span>
            </span>
            <input
              type="checkbox"
              className="size-5 accent-[#c6f24e]"
              {...register('is_active')}
            />
          </label>
        )}
      </div>

      <div className="border-ink-700 flex gap-3 border-t px-6 py-4">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={submitting}>
          {isEditing ? 'Save changes' : 'Create alert'}
        </Button>
      </div>
    </form>
  )
}

export default function AlertFormDrawer() {
  const dispatch = useDispatch()
  const editor = useSelector(selectEditor)
  const close = () => dispatch(editorClosed())

  useEffect(() => {
    if (!editor.open) return undefined
    const onKeyDown = (e) => e.key === 'Escape' && dispatch(editorClosed())
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [editor.open, dispatch])

  return (
    <AnimatePresence>
      {editor.open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={editor.alertId === null ? 'Create alert' : 'Edit alert'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            className="border-ink-700 bg-ink-950 fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl"
          >
            <header className="border-ink-700 flex items-center justify-between border-b px-6 py-5">
              <h2 className="text-lg font-semibold tracking-tight">
                {editor.alertId === null ? 'New price alert' : 'Edit alert'}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-ink-400 hover:bg-ink-800 hover:text-ink-100 grid size-9 place-items-center rounded-lg"
              >
                ✕
              </button>
            </header>
            <AlertForm editor={editor} onClose={close} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
