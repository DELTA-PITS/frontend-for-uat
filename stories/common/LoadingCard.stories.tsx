import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import LoadingCard from '@components/common/LoadingCard';

const meta: Meta<typeof LoadingCard> = {
  title: 'Common/LoadingCard',
  component: LoadingCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'The title text of the loading card.' },
    subtitle: { control: 'text', description: 'The subtitle or details description.' },
    className: { control: 'text', description: 'Additional CSS class names to customize styling.' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A card dialog designed to keep users engaged during async operations (like blockchain verification or uploads). It contains an animated loading spinner, a main title, and details subtext.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl mx-auto p-6 bg-base-300 dark:bg-base-900 rounded-2xl flex justify-center items-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoadingCard>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The standard loading view with default title and subtitle.',
      },
    },
  },
  args: {
    title: 'Loading...',
    subtitle: 'Please wait while we process your document...',
  },
};

export const CustomText: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A customized loading view tailored for the blockchain registration stage.',
      },
    },
  },
  args: {
    title: 'Registering Document',
    subtitle: 'Connecting to blockchain and anchoring hash...',
  },
};

export const CustomColors: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A customized loading view featuring a highlighted primary border design.',
      },
    },
  },
  args: {
    title: 'Verifying Integrity',
    subtitle: 'Calculating file checksums...',
    className: 'border-2 border-primary/20',
  },
};
