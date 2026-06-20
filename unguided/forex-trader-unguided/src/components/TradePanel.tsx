import { useState, useRef, useEffect } from 'react'
import type { OrderSide, Quote } from '../types/forex'
import { usePlaceOrder, usePositions } from '../hooks/useTrading'
import { formatPrice, formatUnits } from '../lib/format'

const UNIT_PRESETS = [1_000, 10_000, 100_000]

interface SwipeSliderProps {
  side: 'buy' | 'sell'
  price: string
  label: string
  disabled: boolean
  onSwipeRight: () => void
  onSwipeLeft: () => void
  canSwipeLeft: boolean
  leftLabel: string
}

export function SwipeSlider({
  side,
  price,
  label,
  disabled,
  onSwipeRight,
  onSwipeLeft,
  canSwipeLeft,
  leftLabel,
}: SwipeSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const [maxSlide, setMaxSlide] = useState(100)

  const updateMaxSlide = () => {
    if (trackRef.current) {
      const trackWidth = trackRef.current.clientWidth
      const handleWidth = 80 // handle width is 80px in CSS
      setMaxSlide(Math.max(50, (trackWidth - handleWidth) / 2 - 4))
    }
  }

  useEffect(() => {
    updateMaxSlide()
    const timer = setTimeout(updateMaxSlide, 50)
    window.addEventListener('resize', updateMaxSlide)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateMaxSlide)
    }
  }, [])

  const handleStart = (clientX: number) => {
    if (disabled) return
    setIsDragging(true)
    startXRef.current = clientX
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    let deltaX = clientX - startXRef.current

    // If swiping left is disabled, clamp deltaX to be positive
    if (!canSwipeLeft && deltaX < 0) {
      deltaX = 0
    }

    // Clamp deltaX to [-maxSlide, maxSlide]
    const clamped = Math.max(-maxSlide, Math.min(maxSlide, deltaX))
    setOffset(clamped)
  }

  const handleEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    // Check threshold (85% of maxSlide)
    if (offset >= maxSlide * 0.85) {
      onSwipeRight()
    } else if (offset <= -maxSlide * 0.85 && canSwipeLeft) {
      onSwipeLeft()
    }

    setOffset(0)
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX)
      }
    }
    const onMouseUp = () => {
      handleEnd()
    }
    const onTouchEnd = () => {
      handleEnd()
    }

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('touchmove', onTouchMove)
      window.addEventListener('touchend', onTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging, offset, maxSlide, canSwipeLeft])

  const slidePercent = maxSlide > 0 ? (offset / maxSlide) * 100 : 0

  return (
    <div
      ref={trackRef}
      className={`swipe-track swipe-track--${side} ${disabled ? 'swipe-track--disabled' : ''} ${
        isDragging ? 'swipe-track--dragging' : ''
      }`}
    >
      <div className="swipe-track__background">
        <span
          className={`swipe-label swipe-label--left ${
            offset < -15 ? 'swipe-label--active' : ''
          } ${!canSwipeLeft ? 'swipe-label--disabled' : ''}`}
        >
          {leftLabel}
        </span>
        <span
          className={`swipe-label swipe-label--right ${
            offset > 15 ? 'swipe-label--active' : ''
          }`}
        >
          {label}
        </span>
      </div>

      <div
        className="swipe-track__fill"
        style={{
          width: `${Math.abs(slidePercent)}%`,
          left: slidePercent < 0 ? 'auto' : '50%',
          right: slidePercent < 0 ? '50%' : 'auto',
          backgroundColor:
            slidePercent < 0
              ? 'rgba(216, 74, 74, 0.25)'
              : side === 'buy'
                ? 'rgba(46, 163, 111, 0.35)'
                : 'rgba(216, 74, 74, 0.35)',
        }}
      />

      <div
        className={`swipe-handle swipe-handle--${side}`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          handleStart(e.clientX)
        }}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleStart(e.touches[0].clientX)
          }
        }}
      >
        <span className="swipe-handle__icon">
          {offset > 15 ? '▶' : offset < -15 ? '◀' : '◀ ▶'}
        </span>
        <span className="swipe-handle__price">{price}</span>
      </div>
    </div>
  )
}

export function TradePanel({ quote }: { quote: Quote }) {
  const [units, setUnits] = useState(10_000)
  const placeOrder = usePlaceOrder()
  const { data: positions = [] } = usePositions()

  const currentPosition = positions.find((p) => p.pair === quote.pair)
  const positionUnits = currentPosition ? currentPosition.units : 0

  const submit = (side: OrderSide, orderUnits: number) => {
    placeOrder.mutate({ pair: quote.pair, side, units: orderUnits })
  }

  const hasLong = positionUnits > 0
  const hasShort = positionUnits < 0

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

      <div className="trade-panel__actions">
        {/* Sell Swipe Slider (Shorts) */}
        <SwipeSlider
          side="sell"
          price={formatPrice(quote.bid, quote.decimals)}
          label={`Sell ${formatUnits(units)}`}
          disabled={placeOrder.isPending}
          onSwipeRight={() => submit('sell', units)}
          onSwipeLeft={() => submit('buy', Math.abs(positionUnits))}
          canSwipeLeft={hasShort}
          leftLabel={
            hasShort
              ? `Close Short (${formatUnits(Math.abs(positionUnits))})`
              : 'No Short Position'
          }
        />

        {/* Buy Swipe Slider (Longs) */}
        <SwipeSlider
          side="buy"
          price={formatPrice(quote.ask, quote.decimals)}
          label={`Buy ${formatUnits(units)}`}
          disabled={placeOrder.isPending}
          onSwipeRight={() => submit('buy', units)}
          onSwipeLeft={() => submit('sell', positionUnits)}
          canSwipeLeft={hasLong}
          leftLabel={
            hasLong
              ? `Close Long (${formatUnits(positionUnits)})`
              : 'No Long Position'
          }
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
