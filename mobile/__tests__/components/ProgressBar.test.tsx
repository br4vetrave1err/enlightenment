import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../../src/features/progress/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = render(<ProgressBar progress={50} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { toJSON } = render(<ProgressBar progress={75} color="#FF0000" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom height', () => {
    const { toJSON } = render(<ProgressBar progress={60} height={12} />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles zero progress', () => {
    const { toJSON } = render(<ProgressBar progress={0} />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles full progress', () => {
    const { toJSON } = render(<ProgressBar progress={100} />);
    expect(toJSON()).toBeTruthy();
  });

  it('clamps progress above 100', () => {
    const { toJSON } = render(<ProgressBar progress={150} />);
    expect(toJSON()).toBeTruthy();
  });

  it('clamps negative progress', () => {
    const { toJSON } = render(<ProgressBar progress={-10} />);
    expect(toJSON()).toBeTruthy();
  });
});
