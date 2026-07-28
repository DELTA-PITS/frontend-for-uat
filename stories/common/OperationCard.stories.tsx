import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import OperationCard from '@components/common/OperationCard';
import OperationButton from '@components/common/OperationButton';
import CheckIcon from '@mui/icons-material/Check';
import { FilledIcon } from '@components/common/FilledIcon';

const meta: Meta<typeof OperationCard> = {
  title: 'Common/OperationCard',
  component: OperationCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'The title of the card.' },
    description: { control: 'text', description: 'A brief description or subtitle for the card.' },
    children: { control: { type: 'object' }, description: 'The main content of the card.' },
    actions: { control: { type: 'object' }, description: 'Optional action elements at the bottom of the card.' },
    headerContent: { control: { type: 'object' }, description: 'Optional content displayed above the card (floating).' },
    className: { control: 'text', description: 'Additional CSS class names to customize styling.' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A layout wrapper container featuring a title, description, slot for children (such as file upload zones), and an optional actions bar at the bottom. It can optionally host a floating header element.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OperationCard>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The standard presentation of the card showing a title, description, and placeholder body text without any action buttons.',
      },
    },
  },
  args: {
    title: 'Register Document',
    description: 'Provide details to securely register your document on the blockchain.',
    children: (
      <div className="py-6 text-base-content/85">
        Main card content goes here. You can drop file inputs, preview details, or other elements in this space.
      </div>
    ),
  },
};

export const WithActions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An operational view displaying main content details alongside a primary action button at the bottom.',
      },
    },
  },
  args: {
    title: 'Verification Complete',
    description: 'We have processed the document status.',
    children: (
      <div className="py-4 text-left space-y-2">
        <p className="font-semibold text-success">Verification check passed!</p>
        <p className="text-sm text-base-content/70">The document hash matched the blockchain record.</p>
      </div>
    ),
    actions: (
      <OperationButton
        onClick={() => {}}
        label="Back to Home"
        className="btn-primary w-full"
      />
    ),
  },
};

export const WithHeaderContent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A card showcasing a floating header icon above the container, typically used to display action outcomes.',
      },
    },
  },
  args: {
    title: 'Successful Operation',
    description: 'Your document was verified successfully.',
    headerContent: (
      <div className="flex justify-center">
        <FilledIcon icon={<CheckIcon sx={{ fontSize: 50 }} />} className="size-20 bg-success/20 text-success p-5" />
      </div>
    ),
    children: (
      <div className="pt-8 pb-4 text-base-content/80">
        Review the registered details below. The card title and description are rendered in relation to the floating header icon.
      </div>
    ),
  },
};
