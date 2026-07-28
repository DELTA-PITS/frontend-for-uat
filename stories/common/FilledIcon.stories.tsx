import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FilledIcon } from '@components/common/FilledIcon';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

const meta: Meta<typeof FilledIcon> = {
  title: 'Common/FilledIcon',
  component: FilledIcon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: { type: 'object' },
      description: 'React node for the icon to display.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names to customize styling.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A utility decoration component that wraps a material design icon in a circular, semi-transparent background bubble.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className=" mx-auto p-6 bg-base-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilledIcon>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A basic filled icon using the primary theme color.',
      },
    },
  },
  args: {
    icon: <CheckIcon fontSize="medium" />,
    className: '',
  },
};

export const CustomColor: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A filled icon with custom red classes indicating a failure or warning status.',
      },
    },
  },
  args: {
    icon: <ErrorOutlineOutlinedIcon fontSize="medium" />,
    className: 'bg-error/20 text-error',
  },
};

export const InfoVariant: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A filled icon styled with blue classes representing info or status.',
      },
    },
  },
  args: {
    icon: <CalendarTodayOutlinedIcon fontSize="medium" />,
  },
};

export const Large: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An extra-large icon representation with extra padding for banner headings.',
      },
    },
  },
  args: {
    icon: <CheckIcon style={{ fontSize: '2.5rem' }} />,
    className: 'p-4',
  },
};
