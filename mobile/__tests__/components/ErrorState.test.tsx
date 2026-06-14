import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../../src/components/ui/ErrorState';

describe('ErrorState', () => {
  it('renders correctly with required message', () => {
    const { getByText } = render(<ErrorState message="Something broke" />);
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Something broke')).toBeTruthy();
  });

  it('renders custom title when provided', () => {
    const { getByText } = render(
      <ErrorState title="Custom title" message="Custom error" />
    );
    expect(getByText('Custom title')).toBeTruthy();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorState message="Error" onRetry={onRetry} />
    );
    expect(getByText('Try Again')).toBeTruthy();
    fireEvent.press(getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    const { queryByText } = render(<ErrorState message="Error" />);
    expect(queryByText('Try Again')).toBeNull();
  });
});
