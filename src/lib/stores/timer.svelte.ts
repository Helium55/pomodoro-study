import { browser } from '$app/environment'
import { getCopy } from '../i18n'
import { ipc } from '../ipc'
import { settings } from './settings.svelte'
import { tasks } from './tasks.svelte'
import type { Pomodoro } from '../types'

export type TimerPhase = 'idle' | 'focus' | 'short_break' | 'long_break'
export type TimerStatus = 'idle' | 'running' | 'paused'

class TimerStore {
  phase = $state<TimerPhase>('idle')
  status = $state<TimerStatus>('idle')
  remainingSecs = $state(1500)
  durationSecs = $state(1500)
  completedFocuses = $state(0)
  currentPomodoro = $state<Pomodoro | null>(null)
  completeOverlay = $state(false)

  startMs = 0
  pausedMs = 0
  pausedAt = 0
  frame = 0

  get progress() {
    if (this.durationSecs <= 0) return 0
    return 1 - this.remainingSecs / this.durationSecs
  }

  get label() {
    if (this.phase === 'focus') return 'FOCUS'
    if (this.phase === 'short_break') return 'SHORT BREAK'
    if (this.phase === 'long_break') return 'LONG BREAK'
    return 'READY'
  }

  async startFocus(taskId = tasks.selectedTaskId) {
    this.stopLoop()
    const duration = settings.state.workSecs
    this.currentPomodoro = await ipc.startPomodoro(taskId, duration)
    this.phase = 'focus'
    this.status = 'running'
    this.durationSecs = duration
    this.remainingSecs = duration
    this.startMs = Date.now()
    this.pausedMs = 0
    this.pausedAt = 0
    this.schedule()
  }

  pause() {
    if (this.status !== 'running') return
    this.status = 'paused'
    this.pausedAt = Date.now()
    this.stopLoop()
  }

  resume() {
    if (this.status !== 'paused') return
    this.pausedMs += Date.now() - this.pausedAt
    this.pausedAt = 0
    this.status = 'running'
    this.schedule()
  }

  async interrupt(reason: string, abandoned = true) {
    if (!this.currentPomodoro || this.phase !== 'focus') {
      this.reset()
      return
    }
    const actual = this.durationSecs - this.remainingSecs
    await ipc.interruptPomodoro(this.currentPomodoro.id, reason, actual, abandoned)
    await tasks.load()
    this.reset()
  }

  reset() {
    this.stopLoop()
    this.phase = 'idle'
    this.status = 'idle'
    this.durationSecs = settings.state.workSecs
    this.remainingSecs = settings.state.workSecs
    this.currentPomodoro = null
    this.completeOverlay = false
    this.startMs = 0
    this.pausedMs = 0
    this.pausedAt = 0
  }

  schedule() {
    if (!browser || this.status !== 'running') return
    this.frame = requestAnimationFrame(() => this.tick())
  }

  stopLoop() {
    if (browser && this.frame) {
      cancelAnimationFrame(this.frame)
    }
    this.frame = 0
  }

  tick() {
    if (this.status !== 'running') return
    const elapsed = Math.floor((Date.now() - this.startMs - this.pausedMs) / 1000)
    this.remainingSecs = Math.max(0, this.durationSecs - elapsed)
    if (this.remainingSecs <= 0) {
      void this.finishPhase()
      return
    }
    this.schedule()
  }

  async finishPhase() {
    this.stopLoop()
    if (this.phase === 'focus' && this.currentPomodoro) {
      await ipc.completePomodoro(this.currentPomodoro.id, this.durationSecs)
      this.completedFocuses += 1
      this.completeOverlay = settings.state.notifyFullscreen
      const copy = getCopy(settings.state.language)
      if (settings.state.notifySystem) {
        await ipc
          .notifySystem(copy.notifications.focusCompleteTitle, copy.notifications.focusCompleteBody)
          .catch(() => undefined)
      }
      if (settings.state.notifySound) {
        await ipc.notifySound(settings.state.notifySoundFile).catch(() => undefined)
      }
      if (settings.state.notifyTaskbar) {
        await ipc.notifyTaskbarFlash().catch(() => undefined)
      }
      await tasks.load()
      this.startBreak()
      return
    }
    this.status = 'idle'
    this.phase = 'idle'
    this.durationSecs = settings.state.workSecs
    this.remainingSecs = settings.state.workSecs
    if (settings.state.autoContinue) {
      await this.startFocus()
    }
  }

  startBreak() {
    const isLong = this.completedFocuses % settings.state.longBreakEvery === 0
    this.currentPomodoro = null
    this.phase = isLong ? 'long_break' : 'short_break'
    this.status = 'running'
    this.durationSecs = isLong ? settings.state.longBreakSecs : settings.state.breakSecs
    this.remainingSecs = this.durationSecs
    this.startMs = Date.now()
    this.pausedMs = 0
    this.pausedAt = 0
    this.schedule()
  }
}

export const timer = new TimerStore()
