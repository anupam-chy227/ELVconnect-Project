# Admin Dashboard Implementation

## Steps

- [ ] Step 1: Update `frontend/src/app/globals.css` — Add missing admin design tokens (font styles, spacing utilities) for Tailwind v4
- [ ] Step 2: Create `frontend/src/components/Admin/AdminLayout.tsx` — Master admin layout with sidebar, top header, main content area
- [ ] Step 3: Create `frontend/src/app/(admin)/layout.tsx` — Route group layout with `ProtectedRoute requiredRole="admin"`
- [ ] Step 4: Create `frontend/src/app/(admin)/page.tsx` — Root redirect `/admin` → `/admin/dashboard`
- [ ] Step 5: Create `frontend/src/app/(admin)/dashboard/page.tsx` — Full admin dashboard page (metrics, verification queue, hot zones)
- [ ] Step 6: Edit `frontend/src/components/Dashboard/DashboardLayout.tsx` — Add admin redirect to `/admin/dashboard`
- [ ] Step 7: Edit `frontend/src/app/(dashboard)/dashboard/page.tsx` — Add admin redirect to `/admin/dashboard`
- [ ] Step 8: Run dev server and verify

