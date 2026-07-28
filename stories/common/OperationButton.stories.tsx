import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import OperationButton from '@components/common/OperationButton';
import SendIcon from '@mui/icons-material/Send';
import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

const meta: Meta<typeof OperationButton> = {
  title: 'Common/OperationButton',
  component: OperationButton,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked', description: 'Handler called when the button is clicked.' },
    label: { control: 'text', description: 'The text label displayed on the button.' },
    icon: {
      options: ['None', 'Send', 'Check', 'ChevronLeft', 'Upload', 'Delete', 'Close', 'Search'],
      mapping: {
        None: undefined,
        Send: <SendIcon fontSize="small" />,
        Check: <CheckIcon fontSize="small" />,
        ChevronLeft: <ChevronLeftIcon fontSize="small" />,
        Upload: <UploadIcon fontSize="small" />,
        Delete: <DeleteIcon fontSize="small" />,
        Close: <CloseIcon fontSize="small" />,
        Search: <SearchIcon fontSize="small" />,
      },
      control: {
        type: 'select',
        labels: {
          None: 'No Icon',
          Send: 'Send (Submit)',
          Check: 'Check (Success/Verify)',
          ChevronLeft: 'Chevron Left (Back)',
          Upload: 'Upload',
          Delete: 'Delete',
          Close: 'Close',
          Search: 'Search',
        },
      },
      description: 'Optional icon element rendered before the label.',
    },
    disabled: { control: 'boolean', description: 'Whether the button is in a disabled state.' },
    className: { control: 'text', description: 'Additional CSS classes for variant styling.' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A button component styled to align with the application\'s action workflows. Supports leading icons, custom class variants, and loading or disabled states.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs w-full p-4 m-auto bg-base-100 rounded-lg border border-base-300">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OperationButton>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A standard primary action button without icons.',
      },
    },
  },
  args: {
    label: 'Click Me',
    disabled: false,
    className: 'btn-primary',
  },
};

export const PrimaryWithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A primary button displaying a submission icon before the label.',
      },
    },
  },
  args: {
    label: 'Submit Document',
    disabled: false,
    icon: 'Send' as any,
    className: 'btn-primary',
  },
};

export const SuccessWithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A success variant button with a checkmark icon to submit verification requests.',
      },
    },
  },
  args: {
    label: 'Verify Document',
    disabled: false,
    icon: 'Check' as any,
    className: 'btn-success text-white',
  },
};

export const BackButton: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An outlined button with a back chevron, used to navigate away from the current page.',
      },
    },
  },
  args: {
    label: 'Back to Home',
    disabled: false,
    icon: 'ChevronLeft' as any,
    className: 'btn-outline',
  },
};
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A disabled button representation to prevent user interactions during processes.',
      },
    },
  },
  args: {
    label: 'Submit Document',
    disabled: true,
    icon: 'Send' as any,
    className: '',
  },
};
