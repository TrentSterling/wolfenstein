# Projection regression checks

Run `node --test tests/projection/contract.cjs` for analytic projection checks,
complete frames at corners/cardinal/near-wall/turning poses, and baseline
movement/collision/source invariants. The baseline fixture was generated from
public commit `5a57bec624f82db85e404c1d4ce98f7a050d8ed3`; source hashes normalize
line endings only. The independent review additionally compares the DDA result
with exhaustive wall-box intersections and tests nearest-wall ordering.

Run `node tests/projection/browser.cjs` with the workflow's pinned Playwright and
Chrome tooling. It compares 27 actual renders with validated source output at
1280x800, 844x390, 390x844 and 800x800 (108 frame checks). Set
`WOLFENSTEIN_LIVE_URL` for the deployed game. Results go to `.projection-evidence`.

Fixtures disable only the interval scheduler and set player poses directly.
Movement tests assign the existing control-state object and call the existing
update function. No pointer/keyboard events, focus changes or audio actions are
used. The full original About gate remains separate and unchanged.

The camera uses a unit forward vector and perpendicular plane scaled by
`tan(FOV / 2)`. Unnormalized rays retain a forward component of one, so their DDA
parameter is perpendicular depth. Centred column samples give symmetric frustum
coverage. The logical 120x40 image and legacy glyph/layout aspect stay fixed at
all viewport sizes; this release does not claim a responsive-layout change.
