import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '../lib/config'
import { credentialsSet, loggedOut } from '../features/auth/authSlice'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders(headers, { getState }) {
    const token = getState().auth.token
    if (token) headers.set('Authorization', `Token ${token}`)
    return headers
  },
})

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && api.getState().auth.token) {
    api.dispatch(loggedOut())
  }
  return result
}

const MAX_ALERT_PAGES = 25

const patchAlerts = (dispatch, recipe) =>
  dispatch(api.util.updateQueryData('getAlerts', undefined, recipe))

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Alert'],
  endpoints: (build) => ({
    // ── Auth ────────────────────────────────────────────────────────────────
    login: build.mutation({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted({ username }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(credentialsSet({ token: data.token, username }))
        } catch {
          // Surfaced to the form through the mutation result.
        }
      },
    }),
    register: build.mutation({
      query: (body) => ({ url: '/auth/register/', method: 'POST', body }),
    }),
    logout: build.mutation({
      query: () => ({ url: '/auth/logout/', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // Sign out locally whether or not the server call succeeds.
        try {
          await queryFulfilled
        } finally {
          dispatch(loggedOut())
        }
      },
    }),

    getCryptocurrencies: build.query({
      query: () => '/cryptocurrencies/',
    }),

    getAlerts: build.query({
      async queryFn(_arg, _api, _extra, fetchWithBQ) {
        const alerts = []
        for (let page = 1; page <= MAX_ALERT_PAGES; page += 1) {
          const result = await fetchWithBQ({ url: '/alerts/', params: { page } })
          if (result.error) return { error: result.error }
          alerts.push(...result.data.results)
          if (!result.data.next) break
        }
        return { data: alerts }
      },
      providesTags: (result = []) => [
        { type: 'Alert', id: 'LIST' },
        ...result.map(({ id }) => ({ type: 'Alert', id })),
      ],
    }),
    createAlert: build.mutation({
      query: (body) => ({ url: '/alerts/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Alert', id: 'LIST' }],
    }),
    updateAlert: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/alerts/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const undo = patchAlerts(dispatch, (draft) => {
          const alert = draft.find((a) => a.id === id)
          if (alert) Object.assign(alert, patch)
        })
        try {
          await queryFulfilled
        } catch {
          undo.undo()
        }
      },
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Alert', id }],
    }),
    deleteAlert: build.mutation({
      query: (id) => ({ url: `/alerts/${id}/`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const undo = patchAlerts(dispatch, (draft) => {
          const index = draft.findIndex((a) => a.id === id)
          if (index !== -1) draft.splice(index, 1)
        })
        try {
          await queryFulfilled
        } catch {
          undo.undo()
        }
      },
      invalidatesTags: (_res, _err, id) => [
        { type: 'Alert', id: 'LIST' },
        { type: 'Alert', id },
      ],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCryptocurrenciesQuery,
  useGetAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
} = api
