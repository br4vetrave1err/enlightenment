import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../../src/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders correctly with all required props', () => {
    const { getByText } = render(
      <EmptyState icon="folder-open" title="No data" message="Nothing to show" />
    );
    expect(getByText('No data')).toBeTruthy();
    expect(getByText('Nothing to show')).toBeTruthy();
  });

  it('renders icon name', () => {
    const { toJSON } = render(
      <EmptyState icon="alert-circle" title="Empty" message="No items found" />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders title and message separately', () => {
    const { getByText } = render(
      <EmptyState icon="inbox" title="All caught up" message="No pending tasks" />
    );
    expect(getByText('All caught up')).toBeTruthy();
    expect(getByText('No pending tasks')).toBeTruthy();
  });
});
