# Mobile photo zoom for Client Deliveries

## Scope
- Keep the existing lightbox layout, desktop behavior, controls, downloads, sharing, backdrop close, and swipe hint unchanged.
- Add touch-only zoom and pan directly to the opened photograph without adding a dependency.

## Implementation
- Track touch pointers, zoom (1×–4×), and bounded pan inside `PreviewLightbox`.
- Use two-pointer pinch anchored between the fingers; suppress browser pinch only on the photograph interaction surface.
- Use one-finger pan above 1×, while retaining existing horizontal photo swipe at 1×.
- Add double-tap on the photograph to toggle 1×/2×.
- Reset and recenter on image change, return to 1×, close, and reopen.
- Keep toolbar, counter, arrows, and backdrop outside the transformed image layer.

## Verification
- Check the 390px lightbox for pinch, pan, double-tap, reset, 1× swipe navigation, fixed controls, and no horizontal overflow.
- Confirm desktop navigation remains unchanged.
- Run the TypeScript check and production build.
