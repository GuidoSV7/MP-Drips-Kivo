// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { translations } from '../i18n/translations'
import { BuyPage } from './BuyPage'

const createEscrow = vi.fn()

vi.mock('accesly', () => ({ ConnectButton: () => null }))
vi.mock('../context/WalletContext', () => ({
  useWallet: () => ({
    walletAddress:       'GBUYERBUYERBUYERBUYERBUYERBUYERBUYERBUYERBUYERBUYERBUYE',
    connectFreighter:    vi.fn(),
    freighterLoading:    false,
    freighterAddr:       null,
    disconnectFreighter: vi.fn(),
  }),
}))
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({ t: translations.es, setLang: () => {} }),
}))
vi.mock('../hooks/useEscrowFlow', () => ({
  useEscrowFlow: () => ({ createEscrow, loading: false, error: null, result: null }),
}))

const EXP = 1_800_000_000

function openOffer() {
  window.history.pushState({}, '', `/buy?seller=GSELLER&amount=15&title=Cafe&exp=${EXP}`)
  render(<BuyPage />)
  return screen.getByRole('button', { name: /Comprar por 15 USDC/ })
}

describe('BuyPage purchase at the expiry boundary', () => {
  beforeEach(() => {
    createEscrow.mockReset()
    vi.useFakeTimers()
    vi.setSystemTime((EXP - 10) * 1000)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('creates the escrow when the offer has not expired', () => {
    const buy = openOffer()
    vi.setSystemTime(EXP * 1000 - 1)

    fireEvent.click(buy)

    expect(createEscrow).toHaveBeenCalledTimes(1)
  })

  it('does not create the escrow when clicked exactly at exp before the countdown refreshes', () => {
    const buy = openOffer()
    // Jump to exp without running timers: the countdown has not ticked, so the button is still shown.
    vi.setSystemTime(EXP * 1000)
    expect(screen.getByRole('button', { name: /Comprar por 15 USDC/ })).toBe(buy)
    expect(screen.queryByRole('alert')).toBeNull()

    fireEvent.click(buy)

    expect(createEscrow).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('Esta oferta venció.')
    expect(screen.queryByRole('button', { name: /Comprar por/ })).toBeNull()
  })
})
