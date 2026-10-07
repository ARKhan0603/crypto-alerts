import { describe, expect, it } from 'vitest'
import { loggedOut } from '../auth/authSlice'
import reducer, {
  alertsSeeded,
  allNotificationsRead,
  notificationAdded,
  selectFeed,
  selectUnreadCount,
  toastDismissed,
} from './notificationsSlice'

const wrap = (state) => ({ notifications: state })
const init = () => reducer(undefined, { type: 'init' })
const hit = { id: 'alert-1', kind: 'hit', title: 'BTC', message: 'm' }

describe('notificationsSlice', () => {
  it('adds a notification once per id', () => {
    let state = reducer(init(), notificationAdded(hit))
    state = reducer(state, notificationAdded(hit))
    expect(state.ids).toEqual(['alert-1'])
  })

  it('counts unread feed items and clears them', () => {
    let state = reducer(init(), notificationAdded(hit))
    expect(selectUnreadCount(wrap(state))).toBe(1)
    state = reducer(state, allNotificationsRead())
    expect(selectUnreadCount(wrap(state))).toBe(0)
  })

  it('keeps info toasts out of the feed and removes them on dismiss', () => {
    let state = reducer(
      init(),
      notificationAdded({ id: 'i', kind: 'info', title: 'Saved' }),
    )
    expect(selectFeed(wrap(state))).toEqual([])
    state = reducer(state, toastDismissed('i'))
    expect(state.ids).toEqual([])
  })

  it('keeps hit notifications in the feed after the toast is dismissed', () => {
    let state = reducer(init(), notificationAdded(hit))
    state = reducer(state, toastDismissed('alert-1'))
    expect(state.entities['alert-1'].toast).toBe(false)
    expect(selectFeed(wrap(state))).toHaveLength(1)
  })

  it('marks seeded and acknowledges ids without duplicates', () => {
    const state = reducer(reducer(init(), alertsSeeded([1, 2])), alertsSeeded([2, 3]))
    expect(state.seeded).toBe(true)
    expect(state.acknowledged).toEqual([1, 2, 3])
  })

  it('resets on logout', () => {
    const state = reducer(reducer(init(), notificationAdded(hit)), loggedOut())
    expect(state.ids).toEqual([])
    expect(state.seeded).toBe(false)
  })
})
