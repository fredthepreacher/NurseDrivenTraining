# Nurse Driven Training — Changelog

## Real photo integration (graduation, classroom, CPR practice)

- Added 7 authentic photographs supplied by the owner: full CNA graduation-class photo, 2 individual graduate portraits, graduate-with-instructors photo, real classroom instruction photo, adult CPR practice photo, and infant CPR/patient-care practice photo. Renamed with descriptive, SEO-friendly filenames; exported as optimized JPEG + WebP (full-size and mobile variants) with no aggressive filtering, matching the already-polished source images.
- Homepage hero: replaced the older, lower-resolution classroom photo with the new, sharper real classroom instruction photo (same frame/position, updated alt text).
- Homepage: added a new "Real Students. Real Skills. Real Progress." section featuring the graduation-class photo plus both graduate portraits and the graduate-with-instructors photo.
- CNA Training Program page: swapped in the new classroom photo and added a graduation/completion photo section before the final CTA.
- CPR Certification page: added a new "Real skills practice, not just lecture" section with the adult CPR and infant CPR photos side by side.
- HHA Program page: added the infant CPR/patient-care photo to illustrate hands-on safety skills.
- About page: added a "Mentorship that carries through to graduation" section with the graduate-with-instructors photo.
- Admissions page: added a "Students who walked this same path" section with a graduate portrait and the graduation-class photo.
- All new images use `<picture>` with WebP + JPEG sources, `srcset`/`sizes` for mobile-appropriate file sizes, `width`/`height` to prevent layout shift, `loading="lazy"` (except the hero, which stays eager/high-priority), and unique, accurate alt text.
- Not done this round (deferred, out of scope for this pass): a dedicated photo gallery page, per-photo `object-position` tuning at all 5 required breakpoints, a custom 1200×630 Open Graph crop of the graduation photo, and Facility Sponsorship/Clinical Partnerships/Student Resources page placements. All of these are straightforward follow-ups if wanted.

## Contrast and color repairs

- **Fixed a real dark-on-dark bug**: the global `h1, h2, h3, h4 { color: var(--navy); }` rule was overriding the light text color on every dark-background section, making the homepage hero heading ("Start a healthcare career, guided by nurses who've done the work."), the "Partner With Us" banner heading, and every inner-page hero heading nearly invisible against the deep berry background.
- Added a new `--peach-heading` CSS variable (`#F5A897`, a warm coral-peach) and a single component-level override (`.hero`, `.page-hero`, `.cta-banner`, `.section-navy` headings) so every heading on a dark berry background now renders in a clearly readable peach-coral instead of dark berry text.
- Verified contrast mathematically against both ends of the hero/CTA gradient: ~4.9:1 against the lighter `--navy` and ~7.6:1 against the darker `--navy-dark` — both comfortably clear the WCAG AA large-text minimum of 3:1, and clear the normal-text minimum of 4.5:1 as well.
- Confirmed via search that this fix covers every actual instance in the codebase: all `.hero h1` and `.page-hero h1` headings sitewide, and all 12 `.cta-banner h2` CTA headings across every page.

## Image corrections and optimizations

- Enhanced the three real site photographs (`classroom-session.jpg`, `team-welcome.jpg`, `exterior-storefront.jpg`) to fix the washed-out, flat appearance: reclaimed true black/white points (auto-contrast), and applied a modest, tasteful boost to contrast, saturation, and sharpness — deliberately restrained to avoid unnatural skin tones or a heavy color-filter look.
- Re-exported all three as optimized WebP files alongside the originals, and converted every `<img>` reference to these photos (6 places across `index.html`, `about.html` ×2, `cna-training-program.html`, `contact.html`) into a `<picture>` element with a WebP `<source>` and the original JPEG as fallback — smaller file size for supporting browsers with no loss of compatibility.
- Preserved every existing `width`/`height` attribute and `alt` text exactly as before, so there is no layout shift and no accessibility regression from this change.
- Left image crop/aspect ratio handling as-is (`.photo-frame` + `object-fit: cover`), since it was already correctly tuned for each placement.

## Accessibility changes

- Re-verified (did not need to change): exactly one `<h1>` per page across all 15 pages, no duplicate `id` attributes anywhere, every `<img>` has alt text, every `<label for>` has a matching field id, every skip-link target exists, `lang="en"` is present on every page.
- The heading-contrast fix above is itself an accessibility fix (WCAG 1.4.3/1.4.11 contrast).

## UX and conversion changes

- Softened the homepage programs-section heading from "Programs designed to get you certified and job-ready" to "Programs designed to prepare you for certification and a healthcare career" — the original phrasing could be read as promising a guaranteed outcome; the new phrasing accurately describes program intent without implying a guarantee.

## SEO/schema changes

- No schema structure changes were needed this pass; existing Organization/EducationalOrganization, Course, FAQPage, and BreadcrumbList schema were spot-checked and still match visible page content.

## Performance and technical changes

- WebP image variants reduce transferred image weight by roughly 30–35% versus the JPEG originals on supporting browsers, with no fallback risk (JPEG `<img>` remains the fallback source).
- No console-error-prone patterns found (no orphaned label targets, no duplicate IDs, no missing asset references) — verified via a full sitewide link/asset/label audit.

## Re-verified and confirmed clean (no changes needed)

- Full sitewide scan for "accredited program," "state-approved school," "guaranteed certification/employment/exam passage," "nationally recognized," and named certifying bodies — none found. All accreditation-related copy consistently uses the approved transparency language: *"Nurse Driven Training is currently seeking a qualified sponsor facility as part of its pathway toward the applicable program approval and accreditation requirements. We are committed to transparency, educational quality, and full compliance throughout this process."*
- No broken internal links or missing image/script references anywhere on the site.

## Content that still requires owner verification

See `OWNER-VERIFICATION.md` for the full list. Highlights: confirming the accreditation/sponsorship status wording still matches reality at launch time, instructor/founder credentials, next cohort start date, and a real browser-based Lighthouse/accessibility pass (not performed in this environment).
