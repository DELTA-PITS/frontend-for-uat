import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import SummaryRow from '@components/common/SummaryRow';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';

const meta: Meta<typeof SummaryRow> = {
  title: 'Common/SummaryRow',
  component: SummaryRow,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: { type: 'object' },
      description: 'React node for the icon displayed on the left side of the row.',
    },
    label: {
      control: 'text',
      description: 'The label describing the data field.',
    },
    value: {
      control: 'text',
      description: 'The value for the data field. Displays "N/A" if null or undefined.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A presentation row that displays a key-value data field, complete with a leading icon, key name, and auto-wrapped value. Displays a fallback label if the value is missing.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SummaryRow>;

export const CreatedAt: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays the creation timestamp of a blockchain record with a calendar icon.',
      },
    },
  },
  args: {
    icon: <CalendarMonthOutlinedIcon fontSize="medium" />,
    label: 'Created at',
    value: 'June 5, 2026, 15.49',
  },
};

export const RecordID: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays the unique identifier of the registered record with a tag icon.',
      },
    },
  },
  args: {
    icon: <TagOutlinedIcon fontSize="medium" />,
    label: 'Record ID',
    value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  },
};

export const ContentHash: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays the SHA-256 cryptographic hash of the document with a database icon.',
      },
    },
  },
  args: {
    icon: <StorageOutlinedIcon fontSize="medium" />,
    label: 'Content Hash',
    value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
};

export const MissingValue: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays a row when the value is null or undefined, showing a default placeholder.',
      },
    },
  },
  args: {
    icon: <TagOutlinedIcon fontSize="medium" />,
    label: 'Record ID',
    value: null,
  },
};

export const RegistrationSummary: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A mock composite card demonstrating how multiple summary rows stack together for a registration receipt.',
      },
    },
  },
  render: () => (
    <div className="max-w-xxl w-full mx-auto p-6 bg-base-100 border border-base-300 rounded-2xl shadow-xl">
      <h3 className="text-lg font-bold text-primary mb-6">Registration Details</h3>
      <div className="space-y-4">
        <SummaryRow
          icon={<CalendarMonthOutlinedIcon fontSize="medium" />}
          label="Created at"
          value="June 5, 2026, 15.49"
        />
        <SummaryRow
          icon={<TagOutlinedIcon fontSize="medium" />}
          label="Record ID"
          value="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        />
        <SummaryRow
          icon={<StorageOutlinedIcon fontSize="medium" />}
          label="Content Hash"
          value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        />
      </div>
    </div>
  ),
};

export const VerificationSummary: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A mock composite card demonstrating how multiple summary rows stack together for a verification receipt.',
      },
    },
  },
  render: () => (
    <div className="max-w-xxl w-full mx-auto p-6 bg-base-100 border border-base-300 rounded-2xl shadow-xl">
      <h3 className="text-lg font-bold text-primary mb-6">Registration Details</h3>
      <div className="space-y-4">
        <SummaryRow
          icon={<TagOutlinedIcon fontSize="medium" />}
          label="Record ID"
          value="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        />
        <SummaryRow
          icon={<CalendarMonthOutlinedIcon fontSize="medium" />}
          label="Registered at"
          value="June 5, 2026, 15.49"
        />
        <SummaryRow
          icon={<StorageOutlinedIcon fontSize="medium" />}
          label="Content Hash"
          value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        />
      </div>
    </div>
  ),
};
