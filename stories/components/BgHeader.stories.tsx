import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { BgHeader } from '@components/BgHeader';

interface BgHeaderStoryProps {
  status: 'success' | 'failure';
  source?: 'register' | 'verify';
}

const BgHeaderWrapper = ({ status, source }: BgHeaderStoryProps) => {
  return BgHeader(status, source);
};

const meta: Meta<BgHeaderStoryProps> = {
  title: 'Components/BgHeader',
  component: BgHeaderWrapper,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'radio',
      options: ['success', 'failure'],
      description: 'The operation status result.',
    },
    source: {
      control: 'radio',
      options: ['register', 'verify', undefined],
      description: 'The source component: register or verify.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Renders a decorative background illustration with a status icon. It is positioned at the top of the ResultView component to visually represent the outcome of the operation.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<BgHeaderStoryProps>;

export const Success: Story = {
  args: {
    status: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a colorful confetti background illustration with a checkmark icon to celebrate a successful transaction.',
      },
    },
  },
};

export const FailureRegister: Story = {
  args: {
    status: 'failure',
    source: 'register',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a cloud disconnection icon in red, indicating that the registration failed (e.g., due to network or duplicate status).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="-mt-30">
        <Story />
      </div>
    ),
  ],
};

export const FailureVerify: Story = {
  args: {
    status: 'failure',
    source: 'verify',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a warning background illustration with a close icon, indicating that the file verification failed (e.g., hash mismatch).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="-mt-20">
        <Story />
      </div>
    ),
  ],
};