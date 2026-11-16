/** What a consent's yes covered changed after it was asked (the draft, the thread, the event): the card shows it again and waits. */
export class ConsentChangedError extends Error {
  override name = 'ConsentChangedError'
}
