# PITS - Web Application

Public Information Trust System (PITS) is a web application that allows users to verify the authenticity of documents. It consists of 2 portals:
1. Publisher Portal: Allows publishers to register their documents and create trustmarks.
2. Verification Portal: Allows users to verify the authenticity of documents.

## Getting Started

> [!NOTE]
>
> Make sure to start the backend server. Otherwise, majority of the functionality will fail to work.
>
> Backend repository: (https://github.com/DELTA-PITS/backend-for-uat.git)


Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```
All the following commands will only state the command for `npm`, but you can replace `npm` with `yarn`, `pnpm`, or `bun` as needed.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

# Repository Structure

The PITS V2 Frontend application has the following directory tree structure:

```text
frontend-for-uat/
├── .github/              # GitHub action workflows and CI/CD pipelines
├── .storybook/           # Storybook environment configuration
├── _docs/                # Project documentation (BRD, SRS, architecture, backlog, status log)
├── app/                  # Next.js App Router entry points and routes
│   ├── api/              # API routes: auth, register, verify, records, _lib (shared server helpers)
│   ├── dashboard/        # Publisher dashboard (registered documents, auth-only)
│   ├── publisher/        # Publisher registration/upload portal page (auth-only)
│   ├── result/           # Verification/registration result pages (success, failure)
│   ├── verify/           # Placeholder route — the real public verify UI lives at app/page.tsx (root `/`)
│   ├── layout.tsx        # Root Next.js layout (provides common HTML structure)
│   └── page.tsx          # Public Verify page (root `/`)
├── components/           # Shared and modular UI components
│   ├── auth/             # Session/login-state components
│   ├── common/           # Shared building blocks (OperationCard, PageHero, InfoListCard, Dropzone, ...)
│   ├── dashboard/        # Dashboard-only components (records table, detail drawer, stats)
│   ├── layout/           # Structural components (Header, PageContainer)
│   ├── register/         # Register (Publisher upload) page components
│   └── verify/           # Verify page components (Tips, FAQ, HowItWorks)
├── hooks/                # Custom React hooks (e.g., useUpload)
├── lib/                  # Core utility helpers, i18n dictionary, and parsing tools
├── public/               # Static public resources (logos, background images, SVGs)
├── stories/              # Storybook stories for UI component testing
├── styles/               # Global styling variables and CSS entrypoint (globals.css)
├── types/                # Common TypeScript interface definitions
├── auth.ts               # NextAuth authentication config
├── next.config.ts        # Next.js application configurations
├── postcss.config.mjs    # CSS PostCSS settings (Tailwind / DaisyUI)
├── proxy.ts              # Next.js 16 middleware (route protection for /publisher, /dashboard)
├── tsconfig.json         # TypeScript compile configurations
└── vitest.config.ts      # Vitest configuration — "unit" project (lib/hooks tests) + "storybook" project
```

---
  
# Technical Details

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Styling

This project uses [`TailwindCSS`](https://tailwindcss.com/) as the CSS framework. You can find the configuration file at `postcss.config.mjs`. The global styles are located in `styles/globals.css`.
To speed up and simplify the styling process, this project also uses [`daisyUI`](https://daisyui.com/), a Tailwind CSS component library. You can find the configuration for daisyUI in `styles/globals.css` under the `@plugin "daisyui"` section.

## Using Oxlint

[`Oxlint`](https://oxc.rs/docs/guide/usage/linter) is used for linting. You can run the linter with the following command:

```bash
npm run lint
```

## Building for Production

To create an optimized production build, run the following command:

```bash
npm run build
```

## Starting the Production Server

After building the application, you can start the production server with the following command:

```bash
npm run start
```

## Testing

Running tests is an important part of the development process. This project uses [`Vitest`](https://vitest.dev/) as the testing framework — unit tests for `lib/*.ts` and hooks run under the `unit` project (jsdom environment), configured in `vitest.config.ts`. You can run them with:

```bash
npm run test
```

## Storybook

Storybook is used for developing and testing UI components in isolation. It also acts as interactive overview of all UI components.

To run storybook:

```bash
npm run storybook
```

Running the above command will open storybook in `http://localhost:6006`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS features and API.
- [daisyUI Documentation](https://daisyui.com/docs) - learn about daisyUI features and API.
- [Oxlint Documentation](https://oxc.rs/docs) - learn about Oxlint features and API.
- [Vitest Documentation](https://vitest.dev/guide/) - learn about Vitest features and API.
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - learn about TypeScript features and API.
- [React Documentation](https://react.dev/docs) - learn about React features and API.
- [React Hooks Documentation](https://react.dev/hooks) - learn about React Hooks features and API.

---


## PITS local configuration

Copy the provided environment template:

```bash
cp .env.local.example .env.local
```

Generate a development Auth.js secret and replace the placeholder:

```bash
openssl rand -base64 32
```

The local backend package imports a ready-to-use Keycloak realm with client secret `pits-local-client-secret` and publisher account `test-publisher` / `test`.

Protected routes:

- `/publisher` — document registration
- `/dashboard` — registered document records and blockchain transaction evidence

Public route:

- `/verify` — document verification without authentication
