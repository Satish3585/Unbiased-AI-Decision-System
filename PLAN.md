# Modernization Plan: Unbiased AI Decision System

## Goal
Transform the existing React + FastAPI app into a modern AI dashboard with purple/blue gradient theme, fixed sidebar navigation, separate pages for each workflow step, Chart.js graphs, and smooth animations.

## Information Gathered

### Current Architecture
- **Frontend:** React 18, React Router, Tailwind CSS, Recharts, Lucide React, Axios
- **Backend:** FastAPI, pandas, bias_engine.py, fix_engine.py
- **Pages:** Home (`/`), Analyze (`/analyze`), About (`/about`)
- **State:** All analysis state lives in `AnalyzePage.js` (upload → select columns → analyze → fix)
- **API:** `POST /upload`, `/analyze`, `/fix`, `/reset`

### Existing Files
| File | Status |
|------|--------|
| `App.js` | Router with 3 routes |
| `Layout.js` | Sidebar (3 items), slate theme |
| `HomePage.js` | Landing page with hero + features |
| `AnalyzePage.js` | Upload + columns + results + fix (monolithic) |
| `AboutPage.js` | Info page with metrics explanation |
| `Dashboard.js` | Results display component |
| `Chart.js` | Recharts bar chart |
| `Upload.js` | Drag & drop upload component |
| `api.js` | Axios API client |

## Implementation Plan

### Phase 1: Install Dependencies
- `chart.js` + `react-chartjs-2` (user explicitly requested Chart.js)
- No icon library needed (lucide-react already installed, Heroicons-compatible)

### Phase 2: Create Shared State (Context)
- **NEW:** `frontend/src/context/AppContext.js`
- Stores: file, columns, metadata, target, group, results, fixedResults, explanation, history[]
- Allows navigation between pages without losing analysis state

### Phase 3: Update Layout & Theme
- **MODIFY:** `frontend/src/components/Layout.js`
  - Purple/blue gradient sidebar (`bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900`)
  - 7 nav items with Lucide icons: Dashboard, Upload Dataset, Analyze Bias, Results, Fix Bias, History, About
  - Active page highlighting with glow effect
  - Responsive: collapsible on tablet

### Phase 4: Global Styles
- **MODIFY:** `frontend/src/index.css`
  - Add `animate-fadeIn`, `animate-slideUp`, `animate-pulse` keyframes
  - Gradient utility classes
  - Card hover lift effect

### Phase 5: Reusable Components
- **NEW:** `frontend/src/components/MetricCard.js` — Icon + title + value + subtitle
- **NEW:** `frontend/src/components/ProgressBar.js` — Segmented progress with color coding
- **NEW:** `frontend/src/components/BiasChart.js` — Chart.js bar chart (replaces Recharts)
- **NEW:** `frontend/src/components/PageHeader.js` — Breadcrumb + title
- **NEW:** `frontend/src/components/ActionCard.js` — Dashboard action card with icon + hover effect

### Phase 6: Page Implementations

#### 1. Dashboard Page (`/`)
- **NEW:** `frontend/src/pages/DashboardPage.js`
- Welcome section with AI fairness illustration (gradient orb + Lucide icons)
- 4 action cards: Upload Dataset, Analyze Bias, Explain Results, Fix Bias
- Recent activity preview (if history exists)

#### 2. Upload Dataset Page (`/upload`)
- **NEW:** `frontend/src/pages/UploadDatasetPage.js`
- Large drag & drop zone with dashed border + hover animation
- File name + size display
- Column selection dropdowns (target + protected attribute)
- "Proceed to Analysis" button
- Validation hints (green check / red warning)

#### 3. Analyze Bias Page (`/analyze`)
- **MODIFY:** `frontend/src/pages/AnalyzePage.js`
- Simplified: column selection + "Run Analysis" button
- Shows loading spinner during analysis
- Auto-redirects to Results page on completion

#### 4. Results Page (`/results`)
- **NEW:** `frontend/src/pages/ResultsPage.js`
- 4 metric cards: Group rates (highest + lowest), Bias Gap, Fairness Score
- Chart.js bar chart for approval rates
- Warning banner: "Bias Detected" (red) or "No Bias" (green)
- Progress bar for fairness score
- Explanation card with highlighted insights
- Recommendations bullet list
- "Go to Fix Bias" button

#### 5. Fix Bias Page (`/fix`)
- **NEW:** `frontend/src/pages/FixBiasPage.js`
- "Apply Bias Fix" button (disabled if no analysis done)
- Comparison table: Metric | Before Fix | After Fix | Improvement
- Success message banner: "Bias successfully reduced"
- Before/After bar chart
- "Reset Dataset" button

#### 6. History Page (`/history`)
- **NEW:** `frontend/src/pages/HistoryPage.js`
- Table of past analyses: Date, Dataset, Target, Group, Fairness Score, Status
- Empty state illustration

#### 7. About Page (`/about`)
- **MODIFY:** `frontend/src/pages/AboutPage.js`
- Same content but updated to purple/blue gradient cards
- Match new theme

### Phase 7: Router Update
- **MODIFY:** `frontend/src/App.js`
- Wrap with AppContextProvider
- Add all 7 routes

### Phase 8: Cleanup
- Delete old `Dashboard.js`, `Chart.js`, `Upload.js` (functionality moved into pages)
- Delete temporary Python scripts (`fix_analyze.py`, etc.)

## Design Tokens
- **Primary Gradient:** `from-indigo-600 via-purple-600 to-blue-600`
- **Sidebar Gradient:** `from-indigo-900 via-purple-900 to-blue-900`
- **Card Background:** `bg-white` with `shadow-lg rounded-2xl`
- **Card Hover:** `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- **Success:** `text-emerald-500 bg-emerald-50`
- **Warning:** `text-amber-500 bg-amber-50`
- **Danger:** `text-rose-500 bg-rose-50`
- **Text Primary:** `text-slate-800`
- **Text Secondary:** `text-slate-500`

## Files to Edit (Summary)

| # | File | Action |
|---|------|--------|
| 1 | `package.json` | Install chart.js, react-chartjs-2 |
| 2 | `src/context/AppContext.js` | NEW |
| 3 | `src/App.js` | MODIFY routes + context |
| 4 | `src/index.css` | MODIFY animations + utilities |
| 5 | `src/components/Layout.js` | MODIFY sidebar + theme |
| 6 | `src/components/MetricCard.js` | NEW |
| 7 | `src/components/ProgressBar.js` | NEW |
| 8 | `src/components/BiasChart.js` | NEW (Chart.js) |
| 9 | `src/components/PageHeader.js` | NEW |
| 10 | `src/components/ActionCard.js` | NEW |
| 11 | `src/pages/DashboardPage.js` | NEW |
| 12 | `src/pages/UploadDatasetPage.js` | NEW |
| 13 | `src/pages/AnalyzePage.js` | MODIFY (simplified) |
| 14 | `src/pages/ResultsPage.js` | NEW |
| 15 | `src/pages/FixBiasPage.js` | NEW |
| 16 | `src/pages/HistoryPage.js` | NEW |
| 17 | `src/pages/AboutPage.js` | MODIFY styling |
| 18 | `src/Dashboard.js` | DELETE |
| 19 | `src/Chart.js` | DELETE |
| 20 | `src/Upload.js` | DELETE |

## Followup Steps
1. Install new npm packages
2. Stop frontend dev server, restart to pick up new packages
3. Test full workflow: Dashboard → Upload → Analyze → Results → Fix Bias → History
4. Verify responsive layout on tablet width

