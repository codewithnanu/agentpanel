/**
 * MockEventEmitter replays a fixture array with realistic timing.
 * Each event's delay is calculated as (timestamp - firstTimestamp) / speedMultiplier,
 * preserving the relative cadence of the original event sequence.
 */
export class MockEventEmitter {
  constructor(fixture, onEvent) {
    this.fixture = fixture
    this.onEvent = onEvent
    this.timers = []
  }

  /**
   * @param {number} speedMultiplier - 1 = real time, 2 = 2x faster, etc.
   */
  start(speedMultiplier = 1) {
    if (this.fixture.length === 0) return

    const base = this.fixture[0].timestamp

    this.fixture.forEach((event) => {
      const delay = Math.max(0, (event.timestamp - base) / speedMultiplier)
      const timer = setTimeout(() => {
        this.onEvent(event)
      }, delay)
      this.timers.push(timer)
    })
  }

  stop() {
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
}
