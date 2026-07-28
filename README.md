# PITS - Web Application

Public Information Trust System (PITS) is a web application that allows users to verify the authenticity of documents. It consists of 2 portals:
1. Publisher Portal: Allows publishers to register their documents and create trustmarks.
2. Verification Portal: Allows users to verify the authenticity of documents.

## Getting Started

> [!NOTE]
>
> Make sure to start the backend server. Otherwise, majority of the functionality will fail to work.
>
> Backend repository: https://github.com/DELTA-PITS/V2-Backend


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
V2-Frontend/
├── .github/             # GitHub action workflows and CI/CD pipelines
├── .storybook/          # Storybook environment configuration
├── app/                 # Next.js App Router entry points and routes
│   ├── api/             # API routes (authentication, document upload/processing)
│   ├── dev/             # Developer utilities and sandbox page
│   ├── login/           # Login screen
│   ├── publisher/       # Publisher registration and trustmark portal page
│   ├── result/          # Verification results pages
│   ├── verify/          # User-facing verification portal page
│   ├── layout.tsx       # Root Next.js layout (provides common HTML structure)
│   └── page.tsx         # App main page (handles routing/redirections)
├── components/          # Shared and modular UI components
│   ├── features/        # High-level feature components
│   │   ├── auth/        # Login states and session controls
│   │   ├── result/      # Verification outputs (e.g., loading states, status details)
│   │   └── upload/      # File dropping and document previews
│   ├── layout/          # Structural components (e.g., Header navigation)
│   └── ui/              # Reusable presentational components (buttons, cards, icons)
├── hooks/               # Custom React hooks (e.g., useUpload)
├── lib/                 # Core utility helpers and parsing tools
├── public/              # Static public resources (logos, background images, SVGs)
├── stories/             # Storybook stories for UI component testing
├── styles/              # Global styling variables and CSS entrypoint (globals.css)
├── types/               # Common TypeScript interface definitions
├── auth.ts              # NextAuth authentication config
├── jest.config.ts       # Jest testing configuration
├── next.config.ts       # Next.js application configurations
├── postcss.config.mjs   # CSS PostCSS settings (Tailwind / DaisyUI)
├── proxy.ts             # Development proxy settings
├── tsconfig.json        # TypeScript compile configurations
└── vitest.config.ts     # Vitest configuration for unit/integration tests
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

Running tests is an important part of the development process. This project uses [`Jest`](https://jestjs.io/) as the testing framework. You can run the tests with the following command:

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
- [Jest Documentation](https://jestjs.io/docs) - learn about Jest features and API.
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
