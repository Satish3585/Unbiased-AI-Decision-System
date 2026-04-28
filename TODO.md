# Implementation TODO

## Phase 1: Cleanup
- [x] Delete all temp files (fix_*.py, generate_*.py, write_*.py, gen_*.py, test_*.py, test_upload.csv)

## Phase 2: Backend
- [x] Update requirements.txt (add python-dotenv, google-generativeai)
- [x] Create .env.example
- [x] Fix bias_engine.py (fairness_score 0-100, explain_bias threshold)
- [x] Fix fix_engine.py (guarantee different after results)
- [x] Update main.py (Gemini integration, /explain endpoint)

## Phase 3: Frontend
- [x] Create FixPage.js
- [x] Fix UploadPage.js (conditional hook calls)
- [x] Update ResultsPage.js (dynamic AI explanation)
- [x] Update HomePage.js (cleaner UI)
- [x] Update AboutPage.js (remove GitHub, add description)
- [x] Update Layout.js (remove GitHub link)
- [x] Update api.js (add explainBias)
- [x] Update AppContext.js (aiExplanation state)
- [x] Update AnalyzePage.js (display 0-100 score)

## Phase 4: Testing
- [x] Install deps, restart services
- [x] Test full flow end-to-end

## Status: COMPLETE

