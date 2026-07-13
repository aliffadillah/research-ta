# Task 4: Update Tailwind Config

**Files:**
- Modify: `tailwind.config.ts`

**Interfaces:**
- Adds: Custom sidebar widths, max widths, and mobile menu animations

## Steps

- [ ] **Step 1: Update tailwind.config.ts**

Read current tailwind.config.ts, then modify it - add to `theme.extend`:

```typescript
theme: {
  extend: {
    // ... existing config ...
    
    // Sidebar widths
    width: {
      'sidebar': '16rem',      // 256px - full sidebar
      'sidebar-collapsed': '4rem', // 64px - collapsed sidebar
    },
    
    // Max widths
    maxWidth: {
      'container': '1280px',
      'content': '896px',
    },
    
    // Animation for mobile menu
    animation: {
      // ... existing ...
      'slide-in-left': 'slideInLeft 0.3s ease-out',
      'slide-out-left': 'slideOutLeft 0.3s ease-out',
    },
    keyframes: {
      // ... existing ...
      slideInLeft: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      slideOutLeft: {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-100%)' },
      },
    },
  },
},
```

- [ ] **Step 2: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(tailwind): add sidebar widths and mobile menu animations"
```
