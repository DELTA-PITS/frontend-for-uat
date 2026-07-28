import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import FileUpload from '@components/FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'radio',
      options: ['register', 'verify'],
      description: 'The upload mode of the component.',
    },
    title: { control: 'text', description: 'The title of the card.' },
    description: { control: 'text', description: 'The description of the card.' },
    buttonLabel: { control: 'text', description: 'Custom label for the submit button.' },
    className: { control: 'text', description: 'Additional CSS class names.' },
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    docs: {
      description: {
        component: 'A high-level smart wrapper coordinating dropzone interactions, file verification, document previews, and submission buttons. Please note that the result of the action is not displayed in this component. Uploading a file will result in an endless loading screen. To see the result, please go to the ResultView story.',
      },
    },
  },
  decorators: [
    (Story) => {
      React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
          if (url.includes('/api/register') || url.includes('/api/verify')) {
            return new Response(
              JSON.stringify({
                statusCode: 200,
                data: {
                  content_hash: 'sha256-f6b21650346c7cf6d7870dfb6c61cdcc1a3e6c0c213426e2e50529d297d264a7',
                  record_id: 'rec_83f98c8c2901a91a',
                  created_at: new Date().toISOString(),
                  valid: true,
                },
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
          return originalFetch(input, init);
        };
        return () => {
          window.fetch = originalFetch;
        };
      }, []);

      return (
        <div className="w-full max-w-4xl mx-auto p-4">
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Register: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Configures the file upload workflow for registering new documents.',
      },
    },
  },
  args: {
    mode: 'register',
    title: 'Register New Document',
    description: 'Upload and register a new document to the system.',
    buttonLabel: 'Submit Document',
  },
};

export const Verify: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Configures the file upload workflow for verifying existing documents.',
      },
    },
  },
  args: {
    mode: 'verify',
    title: 'Verify a Document',
    description: 'Upload a document to validate authenticity and integrity.',
    buttonLabel: 'Verify Document',
  },
};
