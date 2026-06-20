import { useState, useRef, useEffect } from 'react'
import type { OrderSide, Quote } from '../types/forex'
import { usePlaceOrder, usePositions } from '../hooks/useTrading'
import { formatPrice, formatUnits } from '../lib/format'

const UNIT_PRESETS = [1_000, 10_000, 100_000]

interface SwipeSliderProps {
  label: string
  price: string
  side: 'buy' | 'sell'
  onOpen: () => void
  onClose: () => void
  canClose: boolean
  closeUnits: number
  decimals: number
  isPending: boolean
}

function SwipeSlider({
  label,
  price,
  side,
  onOpen,
  onClose,
  canClose,
  closeUnits,
  decimals,
  isPending,
}: SwipeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingDirection, setPendingDirection] = useState<'left' | 'right' | null>(null)

  const dragStart = useRef(0)
  const trackWidth = useRef(0)
  const maxDrag = useRef(0)

  // Reset handle position when pending finishes
  useEffect(() => {
    if (!isPending) {
      setPendingDirection(null)
      setDragOffset(0)
    }
  }, [isPending])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPending) return
    const handleEl = e.currentTarget
    const trackEl = handleEl.parentElement
    if (!trackEl) return

    handleEl.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStart.current = e.clientX

    const trackRect = trackEl.getBoundingClientRect()
    const handleRect = handleEl.getBoundingClientRect()
    trackWidth.current = trackRect.width
    maxDrag.current = (trackRect.width - handleRect.width) / 2 - 4
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isPending) return
    const deltaX = e.clientX - dragStart.current

    let targetOffset = deltaX
    if (targetOffset < 0) {
      // Swiping left to close
      if (!canClose) {
        // Rubberband resistance if unable to close
        targetOffset = Math.max(targetOffset * 0.15, -15)
      } else {
        targetOffset = Math.max(targetOffset, -maxDrag.current)
      }
    } else {
      // Swiping right to open
      targetOffset = Math.min(targetOffset, maxDrag.current)
    }

    setDragOffset(targetOffset)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (err) {
      // Ignore
    }

    const ratio = maxDrag.current > 0 ? dragOffset / maxDrag.current : 0
    const THRESHOLD = 0.75

    if (ratio >= THRESHOLD) {
      // Swipe right -> Open
      setPendingDirection('right')
      setDragOffset(maxDrag.current)
      onOpen()
    } else if (ratio <= -THRESHOLD && canClose) {
      // Swipe left -> Close
      setPendingDirection('left')
      setDragOffset(-maxDrag.current)
      onClose()
    } else {
      setDragOffset(0)
    }
  }

  // Calculate normalized ratio: -1 to +1
  const ratio = maxDrag.current > 0 ? dragOffset / maxDrag.current : 0

  // Calculate dynamic opacities and transformations
  const leftOpacity = !canClose
    ? 0.2
    : ratio < 0
      ? Math.max(0, 1 - Math.abs(ratio) * 1.5)
      : Math.max(0, 1 - ratio * 2)

  const rightOpacity = ratio > 0
    ? Math.max(0, 1 - ratio * 1.5)
    : Math.max(0, 1 - Math.abs(ratio) * 2)

  const handleStyle: React.CSSProperties = {
    transform: `translate(-50%, 0) translateX(${dragOffset}px)`,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  }

  const isSelfPending = isPending && pendingDirection !== null

  return (
    <div
      ref={trackRef}
      className={`swipe-slider ${isPending ? 'swipe-slider--disabled' : ''}`}
    >
      {/* Background Overlays for drag visual feedback */}
      <div
        className="swipe-slider__overlay swipe-slider__overlay--left"
        style={{ opacity: ratio < 0 ? Math.min(Math.abs(ratio), 1) : 0 }}
      />
      <div
        className={`swipe-slider__overlay swipe-slider__overlay--right-${side}`}
        style={{ opacity: ratio > 0 ? Math.min(ratio, 1) : 0 }}
      />

      {/* Behind track labels */}
      <div className="swipe-slider__label-container">
        <div
          className={`swipe-slider__label-side swipe-slider__label-side--left ${
            !canClose ? 'swipe-slider__label-side--disabled' : ''
          }`}
          style={{ opacity: leftOpacity }}
        >
          <span>←</span>
          <span>{canClose ? `Close (${formatUnits(closeUnits)})` : 'No Position'}</span>
        </div>
        <div
          className="swipe-slider__label-side swipe-slider__label-side--right"
          style={{ opacity: rightOpacity }}
        >
          <span>{`${label} (${price})`}</span>
          <span>→</span>
        </div>
      </div>

      {/* Swipe Handle */}
      <div
        className={`swipe-slider__handle swipe-slider__handle--${side} ${
          isSelfPending ? 'swipe-slider__handle--pending' : ''
        }`}
        style={handleStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {isSelfPending ? (
          <div className="swipe-slider__spinner" />
        ) : (
          <>
            <span className="swipe-slider__handle-label">
              {side === 'buy' ? 'BUY' : 'SELL'}
            </span>
            <span className="swipe-slider__handle-price">{price}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function TradePanel({ quote }: { quote: Quote }) {
  const [units, setUnits] = useState(10_000)
  const placeOrder = usePlaceOrder()
  const { data: positions = [] } = usePositions()

  const currentPosition = positions.find((p) => p.pair === quote.pair)
  const currentUnits = currentPosition ? currentPosition.units : 0

  const handleOpen = (side: OrderSide) => {
    placeOrder.mutate({ pair: quote.pair, side, units })
  }

  const handleClose = (side: OrderSide) => {
    if (side === 'buy' && currentUnits > 0) {
      placeOrder.mutate({ pair: quote.pair, side: 'sell', units: currentUnits })
    } else if (side === 'sell' && currentUnits < 0) {
      placeOrder.mutate({ pair: quote.pair, side: 'buy', units: Math.abs(currentUnits) })
    }
  }

  return (
    <section className="trade-panel">
      <div className="trade-panel__sizes" role="radiogroup" aria-label="Order size">
        {UNIT_PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            className={`chip${units === value ? ' chip--active' : ''}`}
            onClick={() => setUnits(value)}
          >
            {formatUnits(value)}
          </button>
        ))}
      </div>

      <div className="trade-panel__actions-vertical">
        <SwipeSlider
          label="Sell"
          price={formatPrice(quote.bid, quote.decimals)}
          side="sell"
          onOpen={() => handleOpen('sell')}
          onClose={() => handleClose('sell')}
          canClose={currentUnits < 0}
          closeUnits={currentUnits < 0 ? Math.abs(currentUnits) : 0}
          decimals={quote.decimals}
          isPending={placeOrder.isPending}
        />
        <SwipeSlider
          label="Buy"
          price={formatPrice(quote.ask, quote.decimals)}
          side="buy"
          onOpen={() => handleOpen('buy')}
          onClose={() => handleClose('buy')}
          canClose={currentUnits > 0}
          closeUnits={currentUnits > 0 ? currentUnits : 0}
          decimals={quote.decimals}
          isPending={placeOrder.isPending}
        />
      </div>

      {placeOrder.data && (
        <p className="trade-panel__confirmation">
          {placeOrder.data.side === 'buy' ? 'Bought' : 'Sold'}{' '}
          {formatUnits(placeOrder.data.units)} {placeOrder.data.pair} @{' '}
          {formatPrice(placeOrder.data.price, quote.decimals)}
        </p>
      )}
      {placeOrder.isError && (
        <p className="trade-panel__error">Order failed — please try again.</p>
      )}
    </section>
  )
}

