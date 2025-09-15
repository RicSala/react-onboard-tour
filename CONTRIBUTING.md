# Contributing to Tourista

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

## Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/RicSala/tourista/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem** with as much detail as possible
- **Provide specific examples** to demonstrate the steps (include code snippets, configuration, etc.)
- **Describe the behavior you observed** and explain why it's a problem
- **Explain the expected behavior** and why you expected it
- **Include your environment details** (React version, Next.js version if applicable, browser, OS)

## Feature Requests & Implementation Questions

Before requesting a new feature or asking about implementation:

1. **Check the [README](README.md) and [documentation](https://tinystack.gitbook.io/tourista)** - Your use case might already be supported
2. **Browse existing issues and discussions** - Someone might have already requested it or found a solution
3. **Review the examples** in the demo/examples folder to see if a similar pattern exists

When opening a feature request:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed feature
- **Explain the use case** and why this feature would be useful
- **Include code examples** of how you envision using the feature

## Pull Requests

Before submitting a new pull request, **open an issue first** to discuss it. The feature may already be implemented but not published, or we might have encountered the same situation before and decided against it.

### Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development build:
   ```bash
   pnpm dev
   ```

### Pull Request Guidelines

- **Branch naming**: Use descriptive branch names (e.g., `fix/overlay-scroll-issue`, `feat/custom-animations`)
- **Type safety**: Ensure all TypeScript types are properly defined
- **Documentation**: Update the docs in the `docs` folder if you're adding new features or changing APIs

### Before Submitting

Run these commands to ensure your code meets our standards:

```bash
# Type checking
pnpm tsc --noEmit

# Linting
pnpm lint
```

### Documentation

When adding new features or modifying existing ones:

- Update type definitions in `src/types/index.ts`
- Add JSDoc comments for public APIs
- Update the README with new props, methods, or configuration options
- Include examples showing how to use new features

```

## Questions?

If you have questions about contributing, feel free to:

- Open a [discussion](https://github.com/RicSala/tourista/discussions)
- Ask in an existing related issue
- Contact the maintainers

Thank you for contributing to Tourista! 🎉
```
