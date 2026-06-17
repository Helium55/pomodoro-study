import { ipc } from '../ipc'
import type { SettingsState } from '../types'

const DEFAULTS: SettingsState = {
  workSecs: 1500,
  breakSecs: 300,
  longBreakSecs: 900,
  longBreakEvery: 4,
  autoContinue: false,
  notifySystem: true,
  notifySound: true,
  notifySoundFile: 'ding.mp3',
  notifyFullscreen: true,
  notifyTaskbar: true,
  theme: 'acid'
}

const KEY_MAP: Record<keyof SettingsState, string> = {
  workSecs: 'timer.work_secs',
  breakSecs: 'timer.break_secs',
  longBreakSecs: 'timer.long_break_secs',
  longBreakEvery: 'timer.long_break_every',
  autoContinue: 'timer.auto_continue',
  notifySystem: 'notify.system',
  notifySound: 'notify.sound',
  notifySoundFile: 'notify.sound_file',
  notifyFullscreen: 'notify.fullscreen',
  notifyTaskbar: 'notify.taskbar',
  theme: 'theme'
}

function readSetting<T>(value: string | undefined, fallback: T): T {
  if (value === undefined) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}

class SettingsStore {
  state = $state<SettingsState>({ ...DEFAULTS })
  loaded = $state(false)

  async load() {
    const values = await ipc.getAllSettings()
    this.state.workSecs = Number(readSetting(values[KEY_MAP.workSecs], DEFAULTS.workSecs))
    this.state.breakSecs = Number(readSetting(values[KEY_MAP.breakSecs], DEFAULTS.breakSecs))
    this.state.longBreakSecs = Number(
      readSetting(values[KEY_MAP.longBreakSecs], DEFAULTS.longBreakSecs)
    )
    this.state.longBreakEvery = Number(
      readSetting(values[KEY_MAP.longBreakEvery], DEFAULTS.longBreakEvery)
    )
    this.state.autoContinue = Boolean(
      readSetting(values[KEY_MAP.autoContinue], DEFAULTS.autoContinue)
    )
    this.state.notifySystem = Boolean(readSetting(values[KEY_MAP.notifySystem], true))
    this.state.notifySound = Boolean(readSetting(values[KEY_MAP.notifySound], true))
    this.state.notifySoundFile = String(
      readSetting(values[KEY_MAP.notifySoundFile], DEFAULTS.notifySoundFile)
    )
    this.state.notifyFullscreen = Boolean(readSetting(values[KEY_MAP.notifyFullscreen], true))
    this.state.notifyTaskbar = Boolean(readSetting(values[KEY_MAP.notifyTaskbar], true))
    this.state.theme = String(readSetting(values[KEY_MAP.theme], DEFAULTS.theme))
    this.loaded = true
  }

  async update<K extends keyof SettingsState>(field: K, value: SettingsState[K]) {
    this.state[field] = value
    await ipc.setSetting(KEY_MAP[field], JSON.stringify(value))
  }
}

export const settings = new SettingsStore()
