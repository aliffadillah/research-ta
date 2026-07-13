# Task 9: Add Responsive Card Variants

**Files:**
- Modify: `src/components/ui/index.tsx`

**Interfaces:**
- Add responsive prop to Card component for stacking on mobile

## Steps

- [ ] **Step 1: Read current UI components**

Read `src/components/ui/index.tsx` first, specifically the Card function.

- [ ] **Step 2: Update Card component**

Find the Card function and add a `responsive` prop:

```typescript
export function Card({
  className,
  children,
  hover = false,
  responsive = false, // NEW: Add responsive prop
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { 
  hover?: boolean;
  responsive?: boolean; // NEW
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-card p-6",
        hover && "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1",
        // NEW: Responsive layout classes
        responsive && "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/index.tsx
git commit -m "feat(ui): add responsive prop to Card component"
```
