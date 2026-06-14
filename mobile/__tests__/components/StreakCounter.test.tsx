import React from 'react';
import { render } from '@testing-library/react-native';
import { StreakCounter } from '../../src/features/progress/components/StreakCounter';

describe('StreakCounter', () => {
  it('renders correctly with streak count', () => {
    const { getByText } = render(<StreakCounter streak={5} longestStreak={10} />);
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Day Streak')).toBeTruthy();
  });

  it('renders longest streak', () => {
    const { getByText } = render(<StreakCounter streak={3} longestStreak={7} />);
    expect(getByText('Longest: 7 days')).toBeTruthy();
  });

  it('renders fire icon', () => {
    const { toJSON } = render(<StreakCounter streak={3} longestStreak={5} />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles zero streak', () => {
    const { getByText } = render(<StreakCounter streak={0} longestStreak={0} />);
    expect(getByText('0')).toBeTruthy();
    expect(getByText('Longest: 0 days')).toBeTruthy();
  });
});
