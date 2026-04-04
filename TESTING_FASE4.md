# Manual Testing Guide - FASE 4: Monthly Recurring Expenses

## Prerequisites
- App running locally with `npm run dev`
- User logged in
- Current date: April 4, 2026

## Test Case 1: Basic Monthly Recurrence

### Steps:
1. **Add a monthly recurring expense (March 2026)**
   - Click "+" to open Add Expense Modal
   - Name: "Netflix"
   - Amount: "15000"
   - Date: "2026-03-15"
   - Icon: Movie icon (auto-detected or select)
   - ✅ Check "¿Es un gasto mensual recurrente?"
   - Click "Agregar"

2. **Verify expense appears in March**
   - Should see "Netflix" in expense list
   - Amount: "$15.000"
   - Badge: "Mensual" should appear
   - Date: "15 Mar"

3. **Navigate to April**
   - Click next month arrow (or see current month is April)
   - Wait for page load

4. **Verify recurring copy appears in April**
   - Should see "Netflix" automatically copied
   - Same amount: "$15.000"
   - Same icon (movie)
   - Same badge: "Mensual"
   - Date should be "15 Abr" (day preserved from March 15)
   - **Important**: This should happen automatically when the page loads for April

5. **Verify Supabase has the entry**
   - Open browser DevTools → Network tab
   - Should see POST request to Supabase with new expense
   - Check Supabase dashboard → expenses table → should have 2 Netflix entries (March + April)

## Test Case 2: Date Edge Case (Month with 31 → 28/30 days)

### Steps:
1. **Add expense on month with 31 days (e.g., January)**
   - Navigate to January
   - Name: "Spotify"
   - Amount: "6990"
   - Date: "2026-01-31" ← Day 31
   - ✅ Monthly checkbox
   - Click "Agregar"

2. **Navigate to February (28 days in 2026)**
   - Click next month arrow multiple times to reach February
   - Wait for page load

3. **Verify date adjusted correctly**
   - Should see "Spotify" copied to February
   - Date should be "28 Feb" (last day of February) NOT "31 Feb"
   - This confirms edge case handling works

## Test Case 3: No Duplicates on Same Month

### Steps:
1. **Add monthly expense and navigate to same month twice**
   - Add "Gym" on day 10 with monthly checkbox
   - Navigate away from current month (e.g., to next month, then back)
   
2. **Verify no duplicate "Gym" entries**
   - Should see "Gym" only once in the month
   - The ref-based deduplication should prevent duplicates
   - Check browser console → no warnings about duplicate copies

## Test Case 4: Multiple Recurring Expenses

### Steps:
1. **Add 3 monthly expenses**
   - "Netflix" on day 5
   - "Spotify" on day 10
   - "Gym" on day 20
   - All with ✅ Monthly checkbox

2. **Navigate to next month**
   - Should see all 3 copied automatically
   - Each with correct day of month (5, 10, 20)

3. **Verify all are showing in list and total updates**
   - Total should include all recurring copies
   - History accordion should expand and show all expenses

## Test Case 5: Non-Monthly vs Monthly

### Steps:
1. **Add mix of monthly and one-time expenses**
   - Add "Hogar" on day 1 with ✅ Monthly
   - Add "Supermercado" on day 15 WITHOUT ✅ Monthly
   - Add "Cine" on day 25 with ✅ Monthly

2. **Navigate to next month**
   - Should see copies of "Hogar" and "Cine"
   - Should NOT see "Supermercado" (it's not recurring)

## Test Case 6: Custom Name Mappings with Recurring

### Steps:
1. **Create a custom name mapping**
   - Go to Settings
   - Create mapping: "LaMom" → Comida icon

2. **Add recurring expense using custom mapping**
   - Add expense, type "LaMom"
   - Click autocomplete suggestion
   - Date: day 3
   - ✅ Monthly checkbox
   - Click "Agregar"

3. **Verify in current month**
   - Should see "LaMom" with comida icon
   - Badge: "Mensual"

4. **Navigate to next month**
   - Should see "LaMom" copied with same icon
   - Confirms custom mappings work with recurring

## Browser Console Checks
- ❌ No errors in console
- ❌ No warnings like "Failed to copy recurring expense"
- ✅ Optional: Info logs from `handleMonthlyRecurring` (if debugging enabled)

## Database Verification (Supabase Dashboard)

### Check `expenses` table:
- Monthly expenses should appear twice (or more if you tested multiple months)
- All copies should have:
  - `is_monthly: true`
  - Correct `month` and `year` fields
  - Different `date` values but same day of month (except edge cases)
  - Unique `id` and `created_at` timestamps

### Check IndexedDB (DevTools):
1. Open DevTools → Application → IndexedDB → expenses-store
2. Should see all expenses (local + synced from Supabase)
3. Verify copy has new `id` and correct `date`

## Debugging Tips

### If recurring expenses don't appear:
1. Check browser console for errors
2. Verify `isMonthly` flag is true in IndexedDB
3. Check that month/year in `load()` triggered `handleMonthlyRecurring`
4. Verify ref comparison: `${userId}-${year}-${month}` matches current user

### If duplicates appear:
1. Clear IndexedDB and reload
2. Check `recurringProcessedRef` is working in react devtools
3. Verify `currentMonthNames` Set is correctly preventing duplicates

### If Supabase sync fails:
1. Check `.env.local` has correct credentials
2. Verify RLS policies allow inserts
3. Check Network tab for failed requests
4. Should have warning in console but app shouldn't break
