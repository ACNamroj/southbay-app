# Project Standards & Scalability Improvements

This document outlines the current project standards, identified improvements, and recommendations for making the project more scalable and maintainable.

**Last Updated:** 2025-01-27

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architecture Overview](#architecture-overview)
3. [Identified Improvements](#identified-improvements)
4. [Implementation Recommendations](#implementation-recommendations)
5. [Code Standards](#code-standards)
6. [Testing Strategy](#testing-strategy)
7. [Documentation Standards](#documentation-standards)

---

## Current State Analysis

### ✅ Strengths

1. **Well-organized folder structure** - Clear separation of concerns (services, components, pages, utils, types)
2. **TypeScript usage** - Strong typing throughout the codebase
3. **Error handling** - Centralized error handling with `apiError.ts` utility
4. **API client abstraction** - Good abstraction layer with retry logic and error handling
5. **State management** - Using Umi models for state management
6. **Authentication flow** - Well-implemented token refresh mechanism
7. **Code formatting** - Prettier configured with lint-staged and Husky
8. **Design system** - Theme tokens and CSS variables properly organized

### ⚠️ Areas for Improvement

1. **No test files** - Vitest is configured but no tests exist
2. **Missing environment configuration** - No `.env.example` file
3. **Hardcoded API endpoints** - Endpoints scattered across service files
4. **Limited constants** - Only one constant defined
5. **No ESLint custom rules** - Only extends Umi's default config
6. **Inconsistent barrel exports** - Some modules use index.ts, others don't
7. **Empty pages** - People and Users pages are placeholders
8. **No API response standardization** - Different response shapes handled inconsistently
9. **Missing type guards** - Runtime type validation could be improved
10. **No error boundary logging** - Errors not logged to monitoring service

---

## Architecture Overview

### Current Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Route pages (some empty)
├── services/         # API services (well organized by domain)
├── models/           # Umi state models
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── hooks/            # Custom React hooks
├── layout/           # Layout components and interceptors
├── constants/        # Application constants (minimal)
├── theme/            # Design tokens
└── locales/          # i18n resources
```

### Service Layer Pattern

Services are organized by domain:

- `auth/` - Authentication services
- `user/` - User-related services
- `stores/` - Store management services
- `login/` - Login-specific services

**Good:** Clear domain separation **Improvement:** Could benefit from a base service class or shared utilities

---

## Identified Improvements

### 1. API Endpoint Management

**Current Issue:** API endpoints are hardcoded in service files

```typescript
// Current: Hardcoded in storeService.ts
apiRequest<Store>('/v1/store', { ... })
```

**Recommendation:** Centralize all API endpoints in constants

```typescript
// Proposed: src/constants/apiEndpoints.ts
export const API_ENDPOINTS = {
  STORES: {
    LIST: '/v1/store',
    CREATE: '/v1/store',
    UPDATE: '/v1/store',
    DELETE: (id: number) => `/v1/stores/${id}`,
    EXPORT: '/v1/store/export',
    UPLOAD: '/v1/store/upload',
  },
  // ...
} as const;
```

**Benefits:**

- Single source of truth for endpoints
- Easier to refactor when API changes
- Better IDE autocomplete
- Prevents typos

### 2. Environment Configuration

**Current Issue:** No `.env.example` file, environment variables not documented

**Recommendation:** Create `.env.example` and improve environment variable handling

```bash
# .env.example
BASE_URL=http://localhost:8080
API_TIMEOUT=30000
ENABLE_MOCK=false
```

**Benefits:**

- Clear documentation of required environment variables
- Easier onboarding for new developers
- Better CI/CD configuration

### 3. Testing Infrastructure

**Current Issue:** Vitest configured but no tests exist

**Recommendation:**

- Create test utilities and helpers
- Add example test files for components and services
- Set up test coverage thresholds
- Document testing patterns

**Priority:** High - Critical for maintainability

### 4. ESLint Configuration

**Current Issue:** Only extends Umi's default config

**Recommendation:** Add custom rules for:

- Import ordering
- Unused variables
- React hooks rules
- TypeScript strict checks
- Accessibility rules

### 5. Constants Organization

**Current Issue:** Only one constant defined, hardcoded values throughout codebase

**Recommendation:** Organize constants by domain:

```typescript
// src/constants/index.ts - Barrel export
export * from './apiEndpoints';
export * from './app';
export * from './pagination';
export * from './status';

// src/constants/pagination.ts
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// src/constants/status.ts
export const STORE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;
```

### 6. Barrel Exports Pattern

**Current Issue:** Inconsistent import patterns

**Recommendation:** Use barrel exports (`index.ts`) for:

- Services
- Components
- Utils
- Types
- Constants

**Example:**

```typescript
// src/services/store/index.ts
export * from './storeService';
export type { StoreService } from './storeService';
```

### 7. API Response Standardization

**Current Issue:** Different response shapes handled inconsistently

**Recommendation:** Create base response types:

```typescript
// src/types/api.ts
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};
```

### 8. Error Logging & Monitoring

**Current Issue:** Errors logged to console only, no monitoring integration

**Recommendation:**

- Add error logging service (e.g., Sentry, LogRocket)
- Log errors in ErrorBoundary
- Log API errors with context
- Add error tracking utilities

### 9. Type Guards & Runtime Validation

**Current Issue:** Limited runtime type validation

**Recommendation:** Add type guards for:

- API responses
- Form data
- User input validation

**Example:**

```typescript
// src/utils/typeGuards.ts
export function isStore(obj: unknown): obj is Store {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'status' in obj
  );
}
```

### 10. Component Organization

**Current Issue:** Some pages are very large (Stores/index.tsx is 520+ lines)

**Recommendation:**

- Extract complex logic into custom hooks
- Split large components into smaller sub-components
- Create feature-specific component folders

**Example Structure:**

```
src/pages/Stores/
├── index.tsx              # Main page component
├── components/
│   ├── StoreTable.tsx
│   ├── StoreForm.tsx
│   └── UploadModal.tsx
├── hooks/
│   ├── useStoreActions.ts
│   └── useStoreFilters.ts
└── constants.ts           # Page-specific constants
```

---

## Implementation Recommendations

### Phase 1: Foundation (High Priority)

1. ✅ Create `.env.example` file
2. ✅ Add API endpoint constants
3. ✅ Organize constants by domain
4. ✅ Add ESLint custom rules
5. ✅ Create testing utilities and examples

### Phase 2: Code Quality (Medium Priority)

1. Add barrel exports for all modules
2. Standardize API response types
3. Add type guards for critical types
4. Extract large components into smaller pieces
5. Add JSDoc comments for public APIs

### Phase 3: Monitoring & Observability (Medium Priority)

1. Integrate error monitoring service
2. Add error logging utilities
3. Add performance monitoring
4. Create error tracking dashboard

### Phase 4: Developer Experience (Low Priority)

1. Add Storybook for component documentation
2. Create development guidelines document
3. Add pre-commit hooks for additional checks
4. Create VS Code workspace settings

---

## Code Standards

### Naming Conventions

- **Components:** PascalCase (`StoreTable.tsx`)
- **Hooks:** camelCase starting with `use` (`useStoreActions.ts`)
- **Services:** camelCase (`storeService.ts`)
- **Types:** PascalCase (`Store`, `StorePayload`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)
- **Files:** camelCase for utilities, PascalCase for components

### Import Order

1. React and React-related imports
2. Third-party libraries
3. Internal absolute imports (`@/...`)
4. Relative imports (`./`, `../`)
5. Type imports (use `import type`)

### File Organization

```typescript
// 1. Imports (grouped and ordered)
import React from 'react';
import { Button } from 'antd';
import { apiRequest } from '@/services/client';
import type { Store } from '@/types/store';

// 2. Types/Interfaces
type ComponentProps = { ... };

// 3. Constants
const LOCAL_CONSTANT = 'value';

// 4. Component
export const Component: React.FC<ComponentProps> = () => { ... };

// 5. Exports
export default Component;
```

### Error Handling

- Always use `try-catch` for async operations
- Use centralized error handling utilities
- Provide meaningful error messages
- Log errors appropriately (console in dev, service in prod)

### TypeScript Best Practices

- Use `type` for object shapes, `interface` for extensible contracts
- Prefer `const` assertions for literal types
- Use `as const` for readonly arrays/objects
- Avoid `any`, use `unknown` when type is truly unknown
- Use type guards for runtime validation

---

## Testing Strategy

### Test Structure

```
src/
├── components/
│   └── ErrorBoundary/
│       ├── ErrorBoundary.tsx
│       └── ErrorBoundary.test.tsx
├── services/
│   └── stores/
│       ├── storeService.ts
│       └── storeService.test.ts
└── utils/
    └── apiError.ts
    └── apiError.test.ts
```

### Testing Priorities

1. **Unit Tests:** Utils, services, hooks
2. **Component Tests:** Reusable components
3. **Integration Tests:** Page components with services
4. **E2E Tests:** Critical user flows (optional, using Playwright/Cypress)

### Test Utilities

Create shared test utilities:

- `test-utils.tsx` - React Testing Library helpers
- `mockHandlers.ts` - MSW handlers for API mocking
- `testData.ts` - Test data factories

### Coverage Goals

- **Minimum:** 60% overall coverage
- **Critical paths:** 80%+ (auth, payment, data mutations)
- **Utils:** 90%+
- **Components:** 70%+

---

## Documentation Standards

### Code Comments

- Use JSDoc for public APIs
- Comment complex business logic
- Explain "why" not "what"
- Keep comments up-to-date with code

### README Updates

- Keep README.md current with project structure
- Document new patterns and conventions
- Include examples for common tasks
- Update when adding new features

### Component Documentation

- Document component props
- Include usage examples
- Note any dependencies or requirements
- Document accessibility considerations

---

## Scalability Considerations

### Performance

- Implement code splitting at route level
- Lazy load heavy components
- Optimize bundle size (analyze with webpack-bundle-analyzer)
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

### State Management

- Keep global state minimal
- Use local state when possible
- Consider React Query for server state (future)
- Avoid prop drilling (use context or state management)

### API Design

- Implement request caching
- Add request deduplication
- Use optimistic updates where appropriate
- Implement pagination consistently
- Add request cancellation support

### Code Splitting

- Split by route (already done with Umi)
- Split large components
- Lazy load modals and heavy features
- Split vendor bundles

---

## Maintenance Guidelines

### Regular Tasks

1. **Weekly:** Review and update dependencies
2. **Monthly:** Review error logs and fix common issues
3. **Quarterly:** Audit codebase for technical debt
4. **Annually:** Review and update architecture decisions

### Dependency Management

- Keep dependencies up-to-date
- Review security advisories
- Remove unused dependencies
- Document why specific versions are required

### Code Review Checklist

- [ ] Follows naming conventions
- [ ] Has appropriate tests
- [ ] Handles errors properly
- [ ] Uses TypeScript types correctly
- [ ] No hardcoded values
- [ ] Follows import order
- [ ] Accessible (if UI component)
- [ ] Documented (if public API)

---

## Next Steps

1. Review this document with the team
2. Prioritize improvements based on business needs
3. Create GitHub issues for each improvement
4. Implement improvements incrementally
5. Update this document as standards evolve

---

## References

- [Umi Max Documentation](https://umijs.org/docs/max/introduce)
- [Ant Design Best Practices](https://ant.design/docs/react/recommendation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
