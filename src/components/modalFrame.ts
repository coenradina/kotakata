// Shared frames for the pop-ups that show as a centred card on wide screens
// and as a sheet from the bottom edge on phones.

/** The dimmed page behind the pop-up. */
export const backdropClass = (sheet: boolean, dim = 'bg-ink/50') =>
  sheet ? `fixed inset-0 z-modal flex flex-col justify-end ${dim}` : `fixed inset-0 z-modal flex items-center justify-center ${dim} p-4`

/** The pop-up itself. `wide` is the card's width on big screens. */
export const panelClass = (sheet: boolean, wide: string) =>
  sheet
    ? `sheet-in safe-bottom-lg mx-auto max-h-[90dvh] w-full ${wide} overflow-y-auto rounded-t-lg border-2 border-b-0 border-ink bg-cream shadow-pixel-lg`
    : `card-in max-h-[90vh] w-full ${wide} overflow-y-auto rounded-lg border-2 border-ink bg-cream shadow-pixel-lg`
