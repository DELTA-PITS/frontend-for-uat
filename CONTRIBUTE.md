# Contribution Guidelines

This file explains how to contribute to the project. It covers how to add new pages and standards regarding branching, merging and testing.

### Adding Pages

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

If you want to add more pages, you can create new directories and page files in the `app` directory. For example, if you create a folder and file called `app/about/page.tsx`, it will be accessible at [http://localhost:3000/about](http://localhost:3000/about).

`layout` is a special file that allows you to share UI between pages. You can create a `layout.tsx` file in the `app` directory to wrap all pages, or you can create a `layout.tsx` file in a subdirectory to wrap only the pages in that subdirectory.

## Standards 

### Code Cleanliness

To maintain consistency and quality across the project, "Oxlint" will be used as a linting extension on the frontend. It will be integrated into the commit and pull request pipelines. Oxlint can also be used as a VSCode extension, or integrated into other IDEs.

### Main Branch

The main branch represents the most stable state of the project and can be considered the production-ready version of the system.

**Rules:**
- Contains only fully tested and validated code.
- No direct commits are allowed.
- Changes can only be merged via Pull Requests (PRs) from dev.

Maintaining a stable main branch ensures that there will always be a functioning version of the product ready for use/deployment, regardless of the project’s progress.

### Dev Branch

The development branch acts as the main integration branch for ongoing work.

**Rules:**
- All completed features are merged into dev via PRs from feature branches.
- The branch is used for integration & testing.
- A PR to main should only be submitted once dev is fully functional.

The dev branch allows the team to combine features gradually while maintaining a stable production branch.

### Feature Branches

Each new task or feature will be developed in its own branch. New branches should be created if there are no already existing branches for the task/feature. When development of the task/feature is complete, a Pull Request (PR) will be created to merge into “dev”. After successful merging, the feature branch will be deleted.

**Naming Convention:**
- feature/\<feature-name>
    - For the addition of new features
- bug/\<bug-name>
    - For changes aimed at fixing existing features/code
- test/\<test-name>
    - For the addition of new code that tests existing components

**Examples:**
- "feature/hash-generation"
- "test/hash-generation-testing"
- "bug/metadata-formatting"

Feature branches allow developers to work independently without affecting the shared codebase.

## Commit Messages

Commit messages should follow the commit format defined below, using the existing commit types. The description for commit messages should be written in the imperative mood (as if it described an order), and must not list several changes.

**Commit Format:**
- feat: \<Define new code to be added>
- fix: \<Define fix to be implemented>
- refactor: \<Define code to be changed>
- docs: \<Define documentation to be added>
- style: \<Define format change to be carried out>

**Examples of Good Commit Messages:**
- “feat: implement hash generation for content registration”
- “fix: resolve metadata timestamp formatting issue”
- “refactor: simplify verification service logic”
- “docs: update API documentation”
- “style: linted hash generation function”

**Example of Bad Commit Messages:**
- “Create an auto-deploy file”
- “refactor: added seeding”
- “feat: create better structure for the codebase, add es-lint and prettier for clean and consistent code formatting”

By following these standards, all commit messages will remain immediately comprehensible and of an appropriate scope.

### Pull Requests

All code changes must be integrated through Pull Requests (PRs) At least one team member must review and approve the PR before merging. The individual who submitted the Pull Request must review all comments left by reviewers, and as the repository has GitHub Copilot Reviews enabled its suggestions must be reviewed as well. Each PR must include:

- A clear description of the implemented feature or fix
- A summary of all changes
- Reference to the related task or issue

Before approval, reviewers will verify:

- Code readability and structure
- Functional correctness
- Compliance with existing conventions
- Absence of conflicts with existing features

The Pull Request process ensures that new contributions are reviewed and validated before becoming part of the shared codebase.

### Merge Conflict Resolution

When merge conflicts occur, the developers involved will collaboratively resolve the issue. The process will follow these steps:

1. Identify conflicting sections in the affected files
2. Discuss intended functionality with the involved team members
3. Merge the appropriate changes
4. Test the affected functionality before completing the merge

This ensures that conflicts are resolved carefully without introducing unintended errors.

### Linting

Make sure to run `npm run lint` before committing. These will be run automatically as well in the CI/CD pipeline.