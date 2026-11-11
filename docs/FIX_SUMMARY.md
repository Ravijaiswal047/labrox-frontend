# Fix for Formula Calculated Values Not Displaying on Initial Load

## Problem

Formula-calculated test values (like GLOBULIN, INDIRECT BILIRUBIN, A/G Ratio) were displaying as blank on initial render when the `GetResultEntryData` API was called. The values only appeared after user interaction (focusing on an input field) because that triggered a state update and re-render.

## Root Cause

The issue had multiple contributing factors:

1. **State Mutation Without Update**: The original `ApplyFormula` function was directly mutating the `ResultData` array objects without triggering a React state update.

2. **Timing Issue**: The formulas were being applied synchronously after `setArrangeMentOfData()` was called, but before React had actually updated the `ResultData` state with new values.

3. **Inline Formula Application**: The formula calculation loop was being called immediately in the Promise `.then()` block, but the `ResultData` state hadn't been updated yet, so formulas couldn't reference the correct values.

## Solution Implemented

### 1. Refactored `ApplyFormula` Function

Changed from mutating state directly to returning a new array:

```javascript
const ApplyFormula = (testid, dataArray = null) => {
  const data = dataArray || ResultData;
  // ... formula logic ...
  return updatedData; // Return new array instead of calling setState
};
```

**Benefits:**

- Pure function that doesn't have side effects
- Can be called multiple times in sequence without causing re-renders
- Accepts optional data parameter to work with data in-flight before state update

### 2. Chained Formula Application

Modified `GetResultEntry` to apply all formulas in sequence before a single state update:

```javascript
if (val && val.length > 0) {
  updatedIsTGGreaterThan400();
  let dataWithFormulas = val;
  const uniqueTestIds = [...new Set(val.map((item) => item.TestID))];

  // Apply all formulas sequentially to the data
  uniqueTestIds.forEach((testid) => {
    dataWithFormulas = ApplyFormula(testid, dataWithFormulas);
  });

  // Single state update after all formulas are applied
  setResultData(dataWithFormulas);
}
```

**Benefits:**

- All formulas are applied to the data before any state update
- Single `setResultData` call triggers one re-render with all calculated values
- No race conditions or timing issues

### 3. Updated `handleCheckbox` Function

Modified to properly handle the new `ApplyFormula` return value:

```javascript
const updatedDataWithFormula = ApplyFormula(testid, data);
setResultData(updatedDataWithFormula);
```

### 4. Removed Infinite Loop Prevention

Removed the problematic `useEffect` that was dependent on `ResultData` which caused cascading state updates.

## Test Cases Covered

The fix ensures:

- ✅ Formula values (GLOBULIN, INDIRECT BILIRUBIN, A/G Ratio) display on initial data load
- ✅ No blank values on first render
- ✅ Values update correctly when user modifies dependent test values
- ✅ No infinite re-render loops
- ✅ Flag calculations (High/Low/Normal) work correctly with formula values
- ✅ TG override logic for LDL/VLDL works properly

## Files Modified

- `src/Frontend/Laboratory/ResultEntry.jsx`
  - Refactored `ApplyFormula` function
  - Updated `GetResultEntry` formula application logic
  - Updated `handleCheckbox` to use new formula function signature
  - Removed problematic useEffect dependency

## Performance Impact

- **Positive**: Reduced re-renders (one instead of multiple)
- **Positive**: Synchronous formula calculation without waiting for state updates
- **No degradation**: Formula complexity remains the same
