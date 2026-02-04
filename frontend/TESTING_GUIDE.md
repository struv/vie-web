# Testing Guide - Visual Polish Verification
**How to verify the design improvements are working**

---

## Quick Visual Check

### 1. Open the App
```bash
cd /home/opc/.openclaw/vie-web/frontend
# Start local server (if not running)
python3 -m http.server 8080

# Open in browser
open http://localhost:8080/public/
```

---

## Test Checklist

### ✓ Colors & Contrast

**What to look for:**
- Text is clearly readable (not too dark)
- Status line in top-right is visible
- Borders are visible (not invisible on black)
- Message bubbles have subtle but clear borders

**How to verify:**
1. Read the status text in top-right corner
2. Check message borders - should be visible but subtle
3. Look at input field border - should be clear
4. Compare text colors (primary vs secondary vs tertiary)

**Expected:**
- All text readable with good contrast
- Borders subtle but visible
- No "text disappearing into black"

---

### ✓ Spacing & Rhythm

**What to look for:**
- Consistent padding/gaps between elements
- No cramped areas
- No excessive whitespace
- Harmonious vertical flow

**How to verify:**
1. Scroll through messages - gaps should feel consistent
2. Check input area padding - should feel comfortable
3. Look at voice controls - spacing should match rest of app

**Expected:**
- Consistent 4px-based spacing throughout
- Comfortable, not cramped or too loose

---

### ✓ Button Interactions

**Test each button state:**

**Send Button:**
1. **Hover** - Should lift up slightly, show shadow
2. **Click** - Should press down with scale effect
3. **Disabled** (while typing indicator visible) - Should be grayed out, no hover

**Voice Mic Button:**
1. **Hover** - Should scale up slightly
2. **Press and hold** - Should show purple ring animation
3. **Release** - Should return to normal

**TTS Toggle:**
1. **Hover** - Should lift and show shadow
2. **Click** - Should scale down
3. **Active state** (when on) - Should have purple glow

**Expected:**
- Smooth transitions (no jarring jumps)
- Clear press feedback (scale down)
- Hover states subtle but noticeable

---

### ✓ Animations

**Message entrance:**
1. Send a message
2. Watch new message appear

**Expected:**
- Slides in from bottom with slight scale
- Smooth 0.35s animation
- No linear/robotic motion

**Typing indicator:**
1. Send message and watch typing dots
2. Dots should bounce smoothly

**Expected:**
- Organic bouncing motion
- Smooth easing (not linear)

**Voice pulse rings:**
1. Press and hold mic button
2. Watch purple rings expand

**Expected:**
- Smooth expansion outward
- Fading as they grow
- Two rings offset

---

### ✓ Mobile (Responsive)

**Resize browser window:**
1. Start at desktop width (>1024px)
2. Resize to tablet (768px-1024px)
3. Resize to mobile (<768px)

**What to check:**
- Layout adjusts smoothly
- No weird wrapping/overflow
- Touch targets feel large enough
- Text stays readable (not too small)

**Mobile-specific (if testing on phone):**
1. Tap input field - shouldn't zoom in (16px font prevents this)
2. Tap buttons - should be easy to hit (≥48px)
3. Voice controls stack vertically (not squished horizontally)

**Expected:**
- Smooth responsive transitions
- No layout breaking
- Easy to tap all buttons

---

### ✓ Keyboard Navigation

**Tab through interface:**
1. Press Tab repeatedly
2. Should see purple focus outline on each element
3. Tab order should be logical (input → send → mic → TTS)

**Expected:**
- Clear purple outline (2px, 2px offset)
- No invisible focus states
- Can operate app with keyboard only

---

### ✓ Dark Mode Aesthetic

**Overall visual check:**
- Background is pure black (#000)
- High contrast (easy to read)
- Purple/gold accents used sparingly
- Minimal, clean Vercel-like aesthetic
- No cluttered/busy areas

**Expected:**
- Feels fast and minimal
- High contrast but not harsh
- Neon accents subtle but visible
- Professional Vercel-tier quality

---

## Browser DevTools Tests

### Contrast Ratio Check

1. Open DevTools (F12)
2. Inspect text elements
3. Check contrast ratios in Accessibility panel

**Expected ratios:**
- Primary text (#fafafa on #000): **19.6:1** ✓
- Secondary text (#a0a0a0 on #000): **6.4:1** ✓
- Tertiary text (#707070 on #000): **4.5:1** ✓

All should show green checkmark for WCAG AA.

---

### Animation Performance

1. Open DevTools → Performance
2. Record while sending messages
3. Check frame rate

**Expected:**
- Consistent 60fps
- No jank or dropped frames
- Smooth animations

---

### Responsive Design Mode

1. Open DevTools → Toggle Device Toolbar (Cmd+Shift+M / Ctrl+Shift+M)
2. Test these sizes:
   - iPhone SE (375px) - smallest
   - iPhone 12/13/14 (390px)
   - iPad Mini (768px)
   - Desktop (1920px)

**Expected:**
- Layout works at all sizes
- No horizontal scrolling
- Touch targets adequate on mobile

---

## Lighthouse Audit

### Run Lighthouse
```bash
# Install if needed
npm install -g lighthouse

# Run audit
lighthouse http://localhost:8080/public/ \
  --only-categories=accessibility,performance \
  --view
```

**Expected scores:**
- **Accessibility:** 95-100 (should be perfect or near-perfect)
- **Performance:** 90+ (static site should be fast)

**Key metrics:**
- Contrast: All text passes WCAG AA
- Touch targets: All ≥ 44px
- Focus states: Visible on all interactive elements

---

## Edge Cases to Test

### Long Messages
1. Send a very long message (multiple paragraphs)
2. Check wrapping, scrollbar, readability

**Expected:**
- Text wraps properly
- Message bubble doesn't overflow
- Scrollbar appears if needed

### Multiple Messages
1. Send 10+ messages quickly
2. Check list scrolling, animation performance

**Expected:**
- Smooth scrolling
- Each message animates in
- No lag or jank

### Voice Errors
1. Click mic without microphone permission
2. Should show error state

**Expected:**
- Button shakes (errorShake animation)
- Red glow appears
- Status text shows error message

### Disabled States
1. Click send button while processing
2. Should not respond

**Expected:**
- Button grayed out (40% opacity + grayscale)
- No hover effect
- Cursor shows "not-allowed"

---

## Cross-Browser Testing

### Browsers to Test
- [ ] **Chrome** (desktop + mobile)
- [ ] **Safari** (desktop + iOS)
- [ ] **Firefox**
- [ ] **Edge**

### What to verify per browser:
1. Animations smooth
2. Colors render correctly
3. Layout consistent
4. Touch targets work (mobile)
5. Voice controls work (if supported)

---

## Reduced Motion Test

### Mac
1. System Preferences → Accessibility → Display
2. Enable "Reduce motion"
3. Reload app

### Windows
1. Settings → Ease of Access → Display
2. Enable "Show animations in Windows"
3. Reload app

**Expected:**
- Animations either disabled or nearly instant
- App still functional
- No layout breaks

---

## Comparison Test

### Before/After
If you have the old version:

1. Open old version in one tab
2. Open new version in another tab
3. Switch between tabs

**You should notice:**
- Text easier to read (better contrast)
- Spacing more consistent
- Animations smoother
- Buttons more responsive
- Overall more polished

---

## Common Issues to Check

### ❌ If text is too dark:
- Check CSS variables loaded correctly
- Verify `--text-secondary` is #a0a0a0 (not #888)
- Verify `--text-tertiary` is #707070 (not #555)

### ❌ If animations are linear/jerky:
- Check all animations use `var(--ease-smooth)` or other easing functions
- Look for any `linear` keyword (should only be on loading spinner)

### ❌ If buttons don't respond:
- Check `:hover:not(:disabled)` syntax
- Verify `user-select: none` on buttons
- Check `cursor: pointer` is set

### ❌ If mobile layout breaks:
- Check media query at 768px is applied
- Verify flexbox is supported (all modern browsers)
- Check viewport meta tag in HTML

### ❌ If focus outline missing:
- Check `:focus-visible` styles exist
- Verify browser supports focus-visible (all modern browsers)
- Try tabbing with keyboard (not clicking)

---

## Quick Fixes

### Clear Browser Cache
```bash
# Hard reload
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

### Verify Files Loaded
1. Open DevTools → Network
2. Reload page
3. Check `styles.css` loaded (should be ~20KB)

### Check Console for Errors
1. Open DevTools → Console
2. Should be clean (no errors)

---

## Success Criteria

**Visual Polish is successful if:**

- ✓ All text readable (WCAG AA compliant)
- ✓ Spacing consistent throughout
- ✓ Animations smooth and organic
- ✓ Button feedback clear (hover + press)
- ✓ Mobile layout works (≥320px width)
- ✓ Touch targets adequate (≥44px)
- ✓ Keyboard navigation works
- ✓ Feels "Vercel-tier" minimal and fast
- ✓ No jarring/linear animations
- ✓ Professional, polished aesthetic

---

## Need Help?

**Documentation:**
- `DESIGN_SYSTEM.md` - Complete design specs
- `DESIGN_CHANGELOG.md` - What changed
- `VISUAL_EXAMPLES.md` - Code examples
- `DESIGN_QUICKREF.md` - Quick patterns

**Quick command to verify files:**
```bash
cd /home/opc/.openclaw/vie-web/frontend
ls -lh public/styles.css  # Should be ~20KB
grep "WCAG" DESIGN_SYSTEM.md  # Should find references
```

---

**Test thoroughly. Ship confidently.** ✓
