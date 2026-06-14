import React from 'react';
import { render } from '@testing-library/react-native';
import { WeeklyChart } from '../../src/features/progress/components/WeeklyChart';

describe('WeeklyChart', () => {
  const mockData = [2, 4, 1, 5, 3, 0, 2]; // Mon-Sun

  it('renders correctly with data', () => {
    const { getByText } = render(<WeeklyChart data={mockData} />);
    expect(getByText('Weekly Activity')).toBeTruthy();
  });

  it('renders day labels', () => {
    const { getByText } = render(<WeeklyChart data={mockData} />);
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
    expect(getByText('Sun')).toBeTruthy();
  });

  it('renders with empty data', () => {
    const { getByText } = render(<WeeklyChart data={[]} />);
    expect(getByText('Weekly Activity')).toBeTruthy();
  });

  it('renders with single day data', () => {
    const { getByText } = render(<WeeklyChart data={[5]} />);
    expect(getByText('Weekly Activity')).toBeTruthy();
  });
});
