# Image masters

Preservation copies of the source renders behind published illustrations. They
are kept for future re-derivation at other sizes or formats.

They live outside `public/` deliberately. Everything under `public/` is copied
into the deployed bundle whether or not a page references it, and these five
PNGs were 27 MiB of that bundle serving no request: the note publishes WebP
derivatives, and nothing links the masters.

`size-the-spa-to-the-river` also produced `site-oblique` and
`summer-river-terrace` derivatives that the published note never used. Those
WebP files were removed; their masters are here, so the derivatives can be
regenerated if the note later wants them.

Derivation and the intent behind each image are recorded in
[`docs/image-briefs/size-the-spa-to-the-river.md`](../../docs/image-briefs/size-the-spa-to-the-river.md).
