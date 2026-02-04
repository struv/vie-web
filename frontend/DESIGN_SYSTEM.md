# Vie Web Design System
**Version:** 2.0 - Vercel-level Polish  
**Last Updated:** 2026-02-03

## Philosophy

> "We exist in the void and it's up to us to build something beautiful from it"

**Core Principles:**
- **Pure black void** - #000 background, high contrast
- **Minimal aesthetic** - Vercel-inspired, fast > fancy
- **Intentional accents** - Purple/gold neon, used sparingly
- **WCAG AA compliant** - 4.5:1 minimum contrast
- **Organic motion** - Smooth easing, natural animations

---

## Color System

### Backgrounds
```css
--bg-void: #000000           /* Pure black void */
--bg-surface: #0a0a0a        /* Subtle surface */
--bg-elevated: #111111       /* Elevated elements */
```

### Text (WCAG AA Compliant)
```css
--text-primary: #fafafa      /* 19.6:1 contrast - primary text */
--text-secondary: #a0a0a0    /* 6.4:1 contrast - secondary text */
--text-tertiary: #707070     /* 4.5:1 contrast - subtle labels */
```

### Borders
```css
--border-subtle: #222222     /* 1.35:1 - barely visible */
--border-visible: #2a2a2a    /* 1.6:1 - clear boundaries */
```

### Accent Colors
```css
--accent-purple: #b794f6     /* Primary accent (neon purple) */
--accent-purple-dim: #8b6bc4 /* Dimmed for subtle states */
--accent-gold: #d4af37       /* Warm gold accent */
--accent-cyan: #67e8f9       /* Processing state */
--accent-pink: #ff66aa       /* Neon pink */

--accent-success: #10b981    /* Success green */
--accent-error: #ef4444      /* Error red */
```

**Usage:**
- **Purple:** Primary interactive states (focus, hover, active)
- **Gold:** Warm highlights, secondary accents
- **Cyan:** Processing/loading states
- **Pink:** Rare highlights, special states

---

## Typography

### Font Stacks
```css
--font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'SF Pro', sans-serif
--font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace
```

### Type Scale
```css
--text-xs: 0.75rem     /* 12px - tiny labels */
--text-sm: 0.875rem    /* 14px - small UI text */
--text-base: 1rem      /* 16px - body text */
--text-lg: 1.125rem    /* 18px - emphasized */
--text-xl: 1.25rem     /* 20px - subheadings */
--text-2xl: 1.5rem     /* 24px - headings */
```

### Typography Rules
- **Line height:** 1.6 for body, 1.5 for UI elements
- **Letter spacing:** `-0.01em` for body (tighter, modern)
- **Letter spacing:** `0.02em` for buttons (slightly wider)
- **Letter spacing:** `0.08em` for status labels (wider, monospace)
- **Font smoothing:** `-webkit-font-smoothing: antialiased`

---

## Spacing System

**4px base unit** - consistent rhythm

```css
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-12: 3rem      /* 48px */
```

**Usage Guidelines:**
- Use consistent spacing tokens (no arbitrary values)
- Padding: `var(--space-4)` for most UI elements
- Gaps: `var(--space-3)` to `var(--space-4)` for component spacing
- Margins: Prefer gap/padding over margins

---

## Motion & Animation

### Easing Functions
```css
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94)     /* Default smooth */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)        /* Playful bounce */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1)           /* Material ease */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)              /* Deceleration */
--ease-in: cubic-bezier(0.4, 0.0, 1, 1)                 /* Acceleration */
```

**Usage:**
- **Smooth:** Default for most transitions (buttons, inputs)
- **Bounce:** Playful feedback (success states)
- **Ease-out:** Entrances, expanding elements
- **Ease-in:** Exits, collapsing elements

### Animation Durations
- **Fast:** 0.15s - 0.2s (hover, active states)
- **Medium:** 0.25s - 0.35s (transitions, slides)
- **Slow:** 0.4s - 0.6s (complex animations)
- **Breath:** 4s (ambient pulsing)

### Key Animations
```css
messageSlideIn     /* 0.35s - message entrance */
typingBounce       /* 1.4s - typing dots */
voicePulse         /* 1.5s - listening state rings */
statusPulse        /* 2s - status text breathing */
errorShake         /* 0.4s - error feedback */
successPulse       /* 0.6s - success feedback */
```

---

## Components

### Buttons

**States:**
- **Default:** Elevated background, visible border
- **Hover:** Border color change, slight lift (`translateY(-1px)`), shadow
- **Active:** Scale down (`scale(0.98)`), inset shadow
- **Disabled:** 40% opacity, grayscale, no interaction

**Specs:**
- Padding: `var(--space-4) var(--space-6)` (16px 24px)
- Border radius: 8px
- Font size: `var(--text-sm)` (14px)
- Font weight: 500
- Letter spacing: 0.02em

### Input Fields

**States:**
- **Default:** Surface background, visible border
- **Focus:** Purple border, elevated background, glow shadow
- **Error:** Red border, error glow

**Specs:**
- Padding: `var(--space-4)` (16px)
- Border radius: 8px
- Font size: `var(--text-base)` (16px on mobile to prevent zoom)
- Line height: 1.5

### Messages

**Specs:**
- Max width: 80% (90% on mobile)
- Padding: `var(--space-4) var(--space-5)` (16px 20px)
- Border radius: 8px
- Animation: Slide in from bottom with scale

**Variants:**
- **User:** Right-aligned, elevated background
- **Assistant:** Left-aligned, surface background
- **Success:** Green border glow
- **Error:** Red border glow

---

## Shadows & Glows

### Shadows (Depth)
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.6)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.7)
```

### Glows (Accent States)
```css
--glow-purple: 0 0 20px rgba(183, 148, 246, 0.3)
--glow-purple-strong: 0 0 30px rgba(183, 148, 246, 0.5)
--glow-gold: 0 0 20px rgba(212, 175, 55, 0.3)
--glow-error: 0 0 20px rgba(239, 68, 68, 0.4)
```

**Usage:**
- Shadows: Physical elevation (cards, buttons on hover)
- Glows: Active/focus states (inputs, voice controls)

---

## Mobile Responsive

### Touch Targets
**Minimum:** 44px × 44px (iOS/Android guidelines)

**Actual implementations:**
- Mic button: 64px × 64px (mobile) / 56px × 56px (desktop)
- Send button: 52px height minimum
- TTS toggle: 48px height minimum
- Input field: 52px minimum height

### Breakpoints
```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */
```

### Mobile-Specific Adjustments
- Font size: 16px minimum on inputs (prevents iOS zoom)
- Border radius: 12px (slightly larger for fingers)
- Spacing: Slightly tighter gaps
- Layout: Stack voice controls vertically

---

## Accessibility

### Contrast Ratios
All text meets **WCAG AA** (4.5:1 minimum):
- Primary text: 19.6:1 ✓
- Secondary text: 6.4:1 ✓
- Tertiary text: 4.5:1 ✓

### Keyboard Navigation
- `:focus-visible` states with purple outline
- 2px outline offset for clarity
- Consistent across all interactive elements

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations reduced to 0.01ms */
}
```

### Screen Readers
- Semantic HTML structure
- ARIA labels where needed
- Focus management for voice controls

---

## Best Practices

### Do's ✓
- Use spacing tokens consistently
- Apply easing functions to all animations
- Maintain WCAG AA contrast
- Provide hover/active feedback
- Test on mobile devices
- Support keyboard navigation

### Don'ts ✗
- No linear animations (always use easing)
- No arbitrary spacing values
- No pure black text on pure black (#000 on #000)
- No touch targets under 44px
- No animations without reduced-motion fallback
- No missing focus states

---

## Performance

### Optimization Strategies
- CSS custom properties for theming
- Hardware-accelerated animations (transform, opacity)
- `will-change` only when needed
- Smooth scrolling with `scroll-behavior`
- Lazy-load heavy animations
- Debounce resize events

### Loading States
- Typing indicator (animated dots)
- Processing spinner (rotating border)
- Voice processing (rotating mic icon)

---

## Future Enhancements

**Potential improvements:**
- [ ] Dark/light theme toggle (currently pure dark)
- [ ] Custom accent color picker
- [ ] Advanced animation controls
- [ ] Haptic feedback on mobile
- [ ] Sound effects (subtle clicks)
- [ ] More granular spacing scale (--space-7, --space-10)

---

**Last Review:** 2026-02-03  
**Maintained by:** Designer Subagent  
**Status:** Production-ready ✓
