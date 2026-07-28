import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import PublisherPortal from '@/app/publisher/page';
import ResultView from '@components/ResultView';
import { useSearchParams, useRouter } from '@storybook/nextjs-vite/navigation.mock';

const RouterContext = React.createContext<any>(null);


const meta: Meta<typeof PublisherPortal> = {
  title: 'Pages/PublisherPortal',
  component: PublisherPortal,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    docs: {
      description: {
        component: 'The main document publisher workspace page. It enables users to drag and drop files to register them on the blockchain, displaying real-time loading feedback and registration outcomes.',
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Re-apply useRouter mock implementation to use React Context for scoped routing
      (useRouter as any).mockImplementation(() => {
        try {
          const contextRouter = React.useContext(RouterContext);
          if (contextRouter) {
            return contextRouter;
          }
        } catch {
          // Fallback in case context is accessed out of render phase
        }
        return {
          push: () => { },
          replace: () => { },
          prefetch: () => { },
          back: () => { },
          forward: () => { },
          refresh: () => { },
        };
      });

      const fetchMock = context.parameters.fetchMock as FetchMockConfig | undefined;

      useEffect(() => {
        if (typeof window === 'undefined') return;
        const originalFetch = window.fetch;

        window.fetch = async (input, init) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

          if (url.includes('/api/register')) {
            // Introduce a simulated 1s network latency for realistic loading experience
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (fetchMock) {
              return new Response(JSON.stringify(fetchMock.body), {
                status: fetchMock.status,
                headers: { 'Content-Type': 'application/json' },
              });
            }

            // Default fallback success response
            return new Response(
              JSON.stringify({
                message: 'Register request succeeded',
                data: {
                  content_hash: 'sha256-f6b21650346c7cf6d7870dfb6c61cdcc1a3e6c0c213426e2e50529d297d264a7',
                  record_id: 'rec_83f98c8c2901a91a',
                  created_at: new Date().toISOString(),
                },
              }),
              {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }

          return originalFetch(input, init);
        };

        return () => {
          window.fetch = originalFetch;
        };
      }, [fetchMock]);

      return (
        <div className="w-full max-w-4xl mx-auto p-4">
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof PublisherPortal>;

export const InitialScreen: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default landing page for publishers, prompting for document uploads.',
      },
    },
  },
  render: () => <InteractivePublisherPortal />,
};

export const DocumentSelected: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The workspace state after a document is selected, showing file details and enabling the registration button.',
      },
    },
  },
  render: () => <SelectedFilePublisherPortal />,
};

export const SuccessScreen: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The success screen shown after a document is successfully registered on the blockchain.',
      },
    },
  },
  render: () => (
    <StaticResultView
      payload={{
        source: "register",
        status: "success",
        response: {
          data: {
            content_hash: "sha256-f6b21650346c7cf6d7870dfb6c61cdcc1a3e6c0c213426e2e50529d297d264a7",
            record_id: "rec_83f98c8c2901a91a",
            created_at: new Date().toISOString()
          }
        }
      }}
    />
  ),
};

// Interface for dynamic fetch mocking parameters
interface FetchMockConfig {
  status: number;
  body: Record<string, unknown>;
}

/**
 * A wrapper to render ResultView statically.
 * It synchronously updates the mocked search params right before rendering
 * to prevent conflicts when multiple ResultViews are displayed concurrently.
 */
function StaticResultView({ payload }: { payload: any }) {
  const searchParamsString = `payload=${encodeURIComponent(JSON.stringify(payload))}`;
  const mockSearchParams = new URLSearchParams(searchParamsString);
  (useSearchParams as any).mockReturnValue(mockSearchParams);

  const paddingClass = payload.status === 'success' ? 'pt-64' : 'pt-28';

  return (
    <div className={`${paddingClass} w-full`}>
      <ResultView status={payload.status} />
    </div>
  );
}

/**
 * A wrapper that renders PublisherPortal and intercepts router navigation
 * to display the Success screen when the file has been successfully uploaded/registered,
 * providing a realistic and complete interactive flow in Storybook.
 */
function InteractivePublisherPortal() {
  const [resultPayload, setResultPayload] = useState<any>(null);

  const mockRouter = React.useMemo(() => {
    return {
      push: (href: string) => {
        try {
          const url = new URL(href, window.location.origin);
          const payloadStr = url.searchParams.get('payload');
          if (payloadStr) {
            const payload = JSON.parse(decodeURIComponent(payloadStr));
            setResultPayload(payload);
          }
        } catch (e) {
          console.error('Failed to parse redirect href:', href, e);
        }
      },
      replace: () => { },
      prefetch: () => { },
      back: () => { },
      forward: () => { },
      refresh: () => { },
    };
  }, []);

  if (resultPayload) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-full">
          <StaticResultView payload={resultPayload} />
        </div>
      </div>
    );
  }

  return (
    <RouterContext.Provider value={mockRouter}>
      <PublisherPortal />
    </RouterContext.Provider>
  );
}

/**
 * A wrapper that Programmatically simulates dropping a file onto the Dropzone component immediately after mounting.
 * This puts the component in the "document selected" state without user action.
 */
function SelectedFilePublisherPortal() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const input = containerRef.current.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      const file = new File(["dummy content"], "annual_financial_report_2026.pdf", { type: "application/pdf" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  return (
    <div ref={containerRef}>
      <InteractivePublisherPortal />
    </div>
  );
}


export const AlreadyExists: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The result screen displayed when attempting to register a document that already exists on the blockchain.',
      },
    },
  },
  render: () => (
    <StaticResultView
      payload={{
        source: "register",
        status: "failure",
        response: {
          data: {
            already_existed: true
          }
        }
      }}
    />
  ),
};

export const ServerError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The error screen displayed when a server-side error occurs during the registration process.',
      },
    },
  },
  render: () => (
    <StaticResultView
      payload={{
        source: "register",
        status: "failure",
        error: "The server encountered an internal error. Please try again later."
      }}
    />
  ),
};
