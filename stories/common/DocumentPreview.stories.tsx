import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import DocumentPreview from '@components/common/DocumentPreview';

const meta: Meta<typeof DocumentPreview> = {
  title: 'Common/DocumentPreview',
  component: DocumentPreview,
  tags: ['autodocs'],
  argTypes: {
    file: {
      control: { type: 'object' },
      description: 'The selected File object.',
    },
    mode: {
      control: 'radio',
      options: ['register', 'verify'],
      description: 'The upload mode, driving the status badge label.',
    },
    onClear: {
      action: 'cleared',
      description: 'Callback function when the user clears the preview.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A detailed item row displaying metadata (file type icon, name, size) of a selected file, along with a status badge and a clear action button.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl mx-auto p-4 bg-base-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DocumentPreview>;

// Mock files using native File API (supported in browser environments)
const mockPdfFile = typeof window !== 'undefined'
  ? new File(['pdf data'], 'annual_audit_report_2026.pdf', { type: 'application/pdf' })
  : null;

const mockExcelFile = typeof window !== 'undefined'
  ? new File(['xlsx data'], 'financial_ledger.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  : null;

const mockImageFile = typeof window !== 'undefined'
  ? new File(['png data'], 'signature_stamp.png', { type: 'image/png' })
  : null;

export const RegisterPDF: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays a selected PDF ready for registration.',
      },
    },
  },
  args: {
    file: mockPdfFile,
    mode: 'register',
  },
};

export const VerifyPDF: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays a selected PDF ready for verification.',
      },
    },
  },
  args: {
    file: mockPdfFile,
    mode: 'verify',
  },
};

export const RegisterExcel: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays a selected spreadsheet document ready for registration.',
      },
    },
  },
  args: {
    file: mockExcelFile,
    mode: 'register',
  },
};

export const VerifyImage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays a selected image document ready for verification.',
      },
    },
  },
  args: {
    file: mockImageFile,
    mode: 'verify',
  },
};

export const WithoutClearButton: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays a document preview that cannot be removed by the user.',
      },
    },
  },
  args: {
    file: mockPdfFile,
    mode: 'register',
    onClear: undefined,
  },
};
