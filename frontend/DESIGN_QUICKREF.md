# Design System Quick Reference
**For developers maintaining Vie Web**

---

## Quick Tokens

### Most-Used Spacing
```css
padding: var(--space-4);              /* 16px - default */
padding: var(--space-4) var(--space-6); /* 16px 24px - buttons */
gap: var(--space-3);                  /* 12px - small gaps */
gap: var(--space-4);                  /* 16px - default gaps */
```

### Most-Used Colors
```css
background: var(--bg-surface);        /* Subtle backgrounds */
color: var(--text-primary);           /* Main text */
color: var(--text-secondary);         /* Secondary text */
border: 1px solid var(--border-visible); /* Default borders */
```

### Most-Used Animations
```css
transition: all 0.2s var(--ease-smooth);  /* Default transitions */
transition: all 0.25s var(--ease-smooth); /* Slightly slower */
animation: fadeIn 0.3s var(--ease-smooth); /* Entrances */
```

---

## Common Patterns

### Button
```css
.my-button {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-elevated);
  border: 1px solid var(--border-visible);
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s var(--ease-smooth);
}

.my-button:hover:not(:disabled) {
  border-color: var(--accent-purple);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.my-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.my-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.5);
}
```

### Input Field
```css
.my-input {
  padding: var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-visible);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all 0.25s var(--ease-smooth);
}

.my-input:focus {
  border-color: var(--accent-purple);
  background: var(--bg-elevated);
  box-shadow: 0 0 0 1px var(--accent-purple), var(--glow-purple);
  outline: none;
}
```

### Card/Panel
```css
.my-card {
  padding: var(--space-6);
  background: var(--bg-surface);
  border: 1px solid var(--border-visible);
  border-radius: 8px;
}
```

### Slide-In Animation
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.my-element {
  animation: slideIn 0.35s var(--ease-smooth);
}
```

---

## Do's & Don'ts

### ✓ DO
```css
/* Use spacing tokens */
padding: var(--space-4);

/* Use easing functions */
transition: all 0.2s var(--ease-smooth);

/* Use color tokens */
color: var(--text-secondary);

/* Use type scale */
font-size: var(--text-sm);

/* Provide hover feedback */
.button:hover { transform: translateY(-1px); }
```

### ✗ DON'T
```css
/* Hard-coded values */
padding: 17px; /* ✗ Use var(--space-4) */

/* Linear animations */
transition: all 0.2s linear; /* ✗ Use var(--ease-smooth) */

/* Arbitrary colors */
color: #777; /* ✗ Use var(--text-secondary) */

/* Random font sizes */
font-size: 0.92rem; /* ✗ Use var(--text-sm) */

/* No hover feedback */
.button { } /* ✗ Add hover state */
```

---

## Accessibility Checklist

- [ ] Text contrast ≥ 4.5:1 (use design system colors)
- [ ] Touch targets ≥ 44px (48px+ preferred)
- [ ] Focus-visible states (purple outline)
- [ ] Keyboard navigation works
- [ ] Reduced motion supported

---

## Mobile Considerations

```css
@media (max-width: 768px) {
  /* Larger touch targets */
  min-height: 52px;
  
  /* Prevent iOS zoom */
  font-size: 16px; /* On inputs */
  
  /* Larger border radius */
  border-radius: 12px;
}
```

---

## When to Use Each Easing

| Easing | Use Case | Example |
|--------|----------|---------|
| `--ease-smooth` | Default transitions | Button hover, input focus |
| `--ease-out` | Entrances | Modals appearing, dropdowns |
| `--ease-in` | Exits | Modals closing, elements hiding |
| `--ease-in-out` | Two-way animations | Toggles, breathing effects |
| `--ease-bounce` | Playful feedback | Success states (use sparingly) |

---

## Common Mistakes to Avoid

1. **Mixing spacing units**
   - ✗ `padding: 15px;`
   - ✓ `padding: var(--space-4);`

2. **Forgetting disabled states**
   - ✗ `.button:hover { }`
   - ✓ `.button:hover:not(:disabled) { }`

3. **No transition on interactive elements**
   - ✗ `.button { background: var(--bg-surface); }`
   - ✓ `.button { background: var(--bg-surface); transition: all 0.2s var(--ease-smooth); }`

4. **Pure black text on pure black**
   - ✗ `color: #000;` on `background: #000;`
   - ✓ Use `--text-primary`, `--text-secondary`, `--text-tertiary`

5. **Linear animations**
   - ✗ `animation: spin 1s linear infinite;`
   - ✓ Only use linear for mechanical rotations (loading spinners)

---

## Testing Commands

```bash
# Check contrast ratios
# Use: https://contrast-ratio.com/

# Text Primary (#fafafa on #000): 19.6:1 ✓
# Text Secondary (#a0a0a0 on #000): 6.4:1 ✓
# Text Tertiary (#707070 on #000): 4.5:1 ✓

# Lighthouse audit
npm run lighthouse

# Visual regression testing
npm run test:visual
```

---

## Need Help?

1. Check `DESIGN_SYSTEM.md` for full documentation
2. Check `DESIGN_CHANGELOG.md` for what changed
3. Look at existing components for patterns
4. Test on mobile device (real device > emulator)

---

**Remember:** Consistency > Creativity. Use the system.
