# Contributing to ProtoPilot

Thank you for your interest in contributing to ProtoPilot! 🎉

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Code Style](#code-style)

---

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/protopilot.git
   cd protopilot
   ```
3. Set up the development environment (see [README.md](README.md#installation))
4. Create a branch for your work

---

## Development Setup

### Backend

```bash
cd app/backend
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp ../../.env.example .env  # Fill in your values
uvicorn server:app --reload
```

### Frontend

```bash
cd app/frontend
yarn install
yarn start
```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation only |
| `chore/*` | Tooling, CI, dependencies |

Always branch from `main` and submit PRs back to `main`.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

[optional body]
[optional footer]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change, no feature/bug |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Build process, dependencies |

**Examples:**
```bash
git commit -m "feat(auth): add OTP-based forgot-password flow"
git commit -m "fix(backend): remove unused status import"
git commit -m "docs: update README with Docker instructions"
```

---

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add or update tests** where applicable
3. **Ensure the app builds** without errors (`yarn build` for frontend)
4. **Update CHANGELOG.md** with your changes under an `[Unreleased]` section
5. Open a PR with a clear title following the commit convention
6. Fill out the PR template completely
7. Wait for review — maintainers will respond within 48 hours

---

## Reporting Bugs

Before opening an issue:
- Search existing issues to avoid duplicates
- Reproduce the bug consistently

Open an issue with:
- **Summary:** One-line description
- **Steps to reproduce:** Numbered steps
- **Expected behavior:** What should happen
- **Actual behavior:** What happens instead
- **Environment:** OS, browser, Python version, Node version

---

## Suggesting Features

Open a GitHub Discussion or issue tagged `enhancement` with:
- **Problem statement:** What problem does this solve?
- **Proposed solution:** How should it work?
- **Alternatives considered:** What else did you consider?

---

## Code Style

### Python (Backend)
- Use **Black** for formatting: `black app/backend/server.py`
- Follow PEP 8
- Type-annotate all function parameters and return values
- Write docstrings for non-trivial functions

### JavaScript/React (Frontend)
- Use functional components with hooks only
- Use descriptive variable/function names
- Keep components focused — one responsibility per component
- Use `data-testid` attributes on all interactive elements
- Add `aria-label`, `aria-hidden` for accessibility

---

## Questions?

Open a [GitHub Discussion](https://github.com/yourusername/protopilot/discussions) — we're happy to help!
