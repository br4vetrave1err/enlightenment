# Mobile Development Guide (Obytes Template Pattern)

This project follows the [Obytes React Native Template](https://github.com/obytes/react-native-template-obytes) architecture and conventions.

## 📱 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Expo SDK with Expo Router |
| **Language** | TypeScript |
| **Styling** | TailwindCSS (NativeWind v4) |
| **State Management** | Zustand |
| **Data Fetching** | React Query (TanStack Query) |
| **Forms** | TanStack Form + Zod validation |
| **Local Storage** | react-native-mmkv |
| **Navigation** | Expo Router (file-based) |
| **i18n** | i18next |
| **Testing** | Jest + React Testing Library (unit), Maestro (E2E) |
| **Git Hooks** | Husky + lint-staged + commitlint |
| **CI/CD** | GitHub Actions + EAS Build |

## 📁 Project Structure

```
mobile/
├── src/
│   ├── app/                    # Expo Router pages (file-based routing)
│   │   ├── (auth)/            # Auth route group (login, register, etc.)
│   │   └── (tabs)/            # Tab navigation group (main app tabs)
│   ├── features/              # Feature modules (business logic + UI)
│   │   └── example/
│   │       ├── components/    # Feature-specific components
│   │       ├── hooks/         # Feature-specific hooks
│   │       ├── api/           # Feature-specific API calls
│   │       └── store/         # Feature-specific Zustand stores
│   ├── components/ui/         # Shared UI components (Button, Input, Card, etc.)
│   ├── lib/                   # Utilities, API client, config
│   │   ├── api.ts             # Axios/React Query API client
│   │   ├── utils.ts           # Helper functions
│   │   └── constants.ts       # App constants
│   ├── translations/          # i18n locale files
│   │   ├── en.json
│   │   └── ar.json
│   └── global.css             # TailwindCSS global styles
├── __tests__/                 # Jest unit tests
└── .maestro/                  # E2E test flows
```

## 🎯 Development Conventions

### File Naming
- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Hooks**: `usePascalCase.ts` (e.g., `useAuth.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Feature directories**: `kebab-case` (e.g., `user-profile/`)
- **Route files**: `kebab-case.tsx` or `index.tsx`

### Component Structure
```typescript
// Feature component example
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  // hooks
  const { data, isLoading } = useUser(userId);
  
  // render
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">{data.name}</Text>
      <Button label="Edit" onPress={handleEdit} />
    </View>
  );
}
```

### State Management Pattern
- **Global state**: Zustand stores in `features/*/store/`
- **Server state**: React Query hooks in `features/*/api/`
- **Local state**: `useState`/`useReducer` within components

### API Integration
```typescript
// features/user/api/user-api.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.get(`/users/${userId}`),
  });
}
```

### Form Handling
```typescript
// Using TanStack Form + Zod
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      const validated = loginSchema.parse(value);
      await login(validated);
    },
  });
  
  // render form with form.Field()
}
```

## 🧪 Testing

### Unit Tests (Jest)
```typescript
// __tests__/user-profile.test.tsx
import { render, screen } from '@testing-library/react-native';
import { UserProfile } from '@/features/user/components/user-profile';

describe('UserProfile', () => {
  it('renders user name', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByText('John Doe')).toBeTruthy();
  });
});
```

### E2E Tests (Maestro)
```yaml
# .maestro/login-flow.yaml
appId: com.yourapp
---
- launchApp
- tapOn: 'Login'
- inputText: 'user@example.com'
- tapOn: 'Password'
- inputText: 'password123'
- tapOn: 'Sign In'
- assertVisible: 'Welcome'
```

## 🚀 Common Workflows

### Adding a New Feature
1. Create feature directory: `mobile/src/features/feature-name/`
2. Add components, hooks, api, store subdirectories
3. Create route in `mobile/src/app/` if needed
4. Write tests in `mobile/__tests__/`
5. Update translations if needed

### Adding a New UI Component
1. Create component in `mobile/src/components/ui/`
2. Export from `mobile/src/components/ui/index.ts`
3. Add Storybook story if applicable
4. Write unit tests

### Adding a New Route
1. Create file in `mobile/src/app/` following Expo Router conventions
2. Use route groups `(auth)`, `(tabs)` for organization
3. Implement proper navigation with `router.push()` or `router.replace()`

## 📝 Spec Mapping

When creating specs in `specs/` directory:
- **Mobile features** → `mobile/src/features/`
- **Mobile routes** → `mobile/src/app/`
- **Mobile UI components** → `mobile/src/components/ui/`
- **Shared API contracts** → `shared/`

## 🔗 References

- [Obytes Template Repository](https://github.com/obytes/react-native-template-obytes)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind v4](https://www.nativewind.dev/v4/overview)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)
- [TanStack Form](https://tanstack.com/form/latest)
- [Maestro E2E Testing](https://maestro.mobile.dev/)
