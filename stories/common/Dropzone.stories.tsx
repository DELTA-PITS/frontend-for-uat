import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Dropzone from '@components/common/Dropzone';

const meta: Meta<typeof Dropzone> = {
  title: 'Common/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  argTypes: {
    onFileSelect: {
      action: 'fileSelected',
      description: 'Callback function triggered when a file is selected/dropped.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'An interactive drag-and-drop region powered by react-dropzone. Supports hover visual feedback and click-to-browse prompts.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl mx-auto p-4 bg-base-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Dropzone>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default interactive state of the drag-and-drop file container.',
      },
    },
  },
  args: {},
};
