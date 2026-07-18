# Contributing to Istaka Ustası

Thank you for your interest in contributing to Istaka Ustası! This guide outlines the development workflow, coding standards, and PR submission process.

## 🤝 Code of Conduct
By participating in this project, you agree to abide by our code of conduct and maintain a respectful, welcoming environment.

## 🚀 Getting Started

1. Fork the repository and clone it locally:
   ```bash
   git clone https://github.com/your-username/IstakaUstasi.git
   cd IstakaUstasi
   ```
2. Set up the development environments for both the backend and frontend (refer to the [README.md](README.md) for details).

## 📝 Coding Standards

### Git Commit Messages
We use **Conventional Commits** to automate releases and changelogs via Google's `release-please`. Commit messages must follow this structure:

```text
<type>(<scope>): <description>

[optional body]
```

**Common Types:**
* `feat`: A new feature (e.g., `feat(solver): add backtracking strategy`)
* `fix`: A bug fix (e.g., `fix(rack): repair drag slot alignment`)
* `docs`: Documentation updates (e.g., `docs(readme): add docker run guides`)
* `style`: Styling changes, formatting, missing semi-colons, etc.
* `refactor`: Code change that neither fixes a bug nor adds a feature
* `perf`: Performance optimizations
* `test`: Adding missing tests or correcting existing tests
* `ci`: CI/CD workflows and scripts updates (e.g., `ci(github): add build tests`)
* `chore`: Package updates, build tool configs, etc.

### Backend (Python)
* Formatting: Follow **Black** rules.
* Imports: Verify import sorting with **isort**.
* Linting: Verify correctness with **flake8** and **mypy** (static typing).
* Formatting commands:
  ```bash
  black app/
  isort app/
  ```

### Frontend (React/TypeScript)
* Formatting: Verify clean builds with strict TypeScript compiler checks (`tsc -b`).
* Linting: Uses **oxlint** as configured in `package.json`.
* Verify compilation before pushing:
  ```bash
  npm run build
  ```

## 📬 Pull Request Process

1. Create a new feature/bugfix branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit your changes using Conventional Commits.
3. Verify backend and frontend builds compile locally.
4. Push your branch to GitHub and open a Pull Request targeting `main`.
5. Ensure all status checks in the GitHub CI/CD pipeline pass successfully.
6. A maintainer will review your Pull Request and merge it once approved.
