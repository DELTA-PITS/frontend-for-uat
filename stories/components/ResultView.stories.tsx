import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ResultView from '@components/ResultView';

const meta: Meta<typeof ResultView> = {
  title: 'Components/ResultView',
  component: ResultView,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'radio',
      options: ['success', 'failure'],
      description: 'The overall result status.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'The final page view rendering the outcome of registration or verification operations, including transaction summaries, status indicators, and next steps.',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const paddingClass = context.args.status === 'success' ? 'pt-64' : 'pt-48';
      return (
        <div className={`w-full max-w-6xl mx-auto p-4 ${paddingClass}`}>
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ResultView>;

// Mock data payloads
const registerSuccessPayload = {
  source: 'register',
  status: 'success',
  response: {
    statusCode: 201,
    data: {
      content_hash: 'f6b21650346c7cf6d7870dfb6c61cdcc1a3e6c0c213426e2e50529d297d264a7',
      record_id: 'rec_83f98c8c2901a91a',
      created_at: '2026-06-05T14:30:00Z',
    },
  },
};

const verifySuccessPayload = {
  source: 'verify',
  status: 'success',
  response: {
    statusCode: 200,
    data: {
      valid: true,
      content_hash: 'f6b21650346c7cf6d7870dfb6c61cdcc1a3e6c0c213426e2e50529d297d264a7',
      record_id: 'rec_83f98c8c2901a91a',
      created_at: '2026-06-05T14:30:00Z',
      filename: 'research_proposal_final.pdf',
    },
  },
};

const registerFailurePayload = {
  source: 'register',
  status: 'failure',
  response: {
    statusCode: 400,
    message: 'Failed to process file registration due to bad formatting.',
  },
  error: 'Bad Request: File cannot be parsed.',
};

const verifyFailurePayload = {
  source: 'verify',
  status: 'failure',
  response: {
    statusCode: 404,
    data: {
      valid: false,
    },
  },
  error: 'Verification failed. Document hash not found in the blockchain records.',
};

export const RegisterSuccess: Story = {
  args: {
    status: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the success receipt with the new record ID, content hash, and timestamp.',
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          payload: encodeURIComponent(JSON.stringify(registerSuccessPayload)),
        },
      },
    },
  },
};

export const VerifySuccess: Story = {
  args: {
    status: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the blockchain validation success panel indicating the document is authentic and untampered.',
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          payload: encodeURIComponent(JSON.stringify(verifySuccessPayload)),
        },
      },
    },
  },
};

export const RegisterFailure: Story = {
  args: {
    status: 'failure',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the error message and recovery suggestions when registration fails.',
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          payload: encodeURIComponent(JSON.stringify(registerFailurePayload)),
        },
      },
    },
  },
};

export const VerifyFailure: Story = {
  args: {
    status: 'failure',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays troubleshooting suggestions when a document cannot be verified on the blockchain.',
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          payload: encodeURIComponent(JSON.stringify(verifyFailurePayload)),
        },
      },
    },
  },
};
