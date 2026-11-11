# LabRox Enterprise LIMS — Frontend Web App (`labrox-frontend`)

[![CI/CD](https://github.com/Ravijaiswal047/labrox-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Ravijaiswal047/labrox-frontend/actions)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

A high-performance React 18 single page application engineered for diagnostic clinical laboratories, hospital chains, and pathology networks. Provides full behavioral, contract, and workflow parity for patient registration, phlebotomy, SRA sample sorting, department receive, clinical result entry, and A4 PDF report dispatch.

---

## ⚡ 5-Command Quickstart

```bash
# 1. Clone repository
git clone https://github.com/Ravijaiswal047/labrox-frontend.git && cd labrox-frontend

# 2. Configure environment variables
cp .env.example .env

# 3. Install dependencies
npm ci

# 4. Start local development server
npm run dev

# 5. Build production bundle
npm run build
```

---

## 🔬 Core Clinical Modules

1. **Patient Registration & Billing:** UHID generation, OPD/IPD investigation package selection, doctor referral, bill receipt print.
2. **Sample Collection (Phlebotomy):** Worklist queue, barcode assignment, sample type validation, re-collection handling.
3. **Sample Sorting (SRA):** Barcode scan accessioning, duplicate sort prevention, department routing.
4. **Department Receive:** Multi-status handling (Received, Rejected, Hold), batch processing, test-wise accept/reject.
5. **Clinical Result Entry:** Dynamic parameter rendering, numeric range checks, delta alerts, doctor assignment, medical approval.
6. **Report Dispatch & Printing:** High-fidelity A4 laboratory test report layout with reference ranges, interpretations, QR code verification, and PDF export.
7. **Quality Control (QC):** Levey-Jennings visual charts, multi-level control lot reviews, Westgard rule flags.

---

## 📖 Documentation

- [Git Flow & Production Release Runbook](docs/GITHUB_WORKFLOW.md)
- [Backend API Gateway Specification](https://github.com/Ravijaiswal047/labrox-api)

---

## 🔒 Security

Strict session termination on idle, sanitized HTML rendering in diagnostic notes, no token storage in insecure locations. Report vulnerabilities to `security@labrox.io`.
