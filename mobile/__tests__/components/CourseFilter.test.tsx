import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CourseFilter } from '../../src/features/courses/components/CourseFilter';

describe('CourseFilter', () => {
  const categories = ['JavaScript', 'React', 'Node.js'];

  it('renders correctly with categories', () => {
    const { getByText } = render(
      <CourseFilter categories={categories} selected={[]} onSelect={jest.fn()} />
    );
    expect(getByText('JavaScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Node.js')).toBeTruthy();
  });

  it('calls onSelect when a category is selected', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <CourseFilter categories={categories} selected={[]} onSelect={onSelect} />
    );
    fireEvent.press(getByText('JavaScript'));
    expect(onSelect).toHaveBeenCalledWith('JavaScript');
  });

  it('renders with selected categories', () => {
    const { toJSON } = render(
      <CourseFilter categories={categories} selected={['React']} onSelect={jest.fn()} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders all categories', () => {
    const { getByText } = render(
      <CourseFilter categories={categories} selected={[]} onSelect={jest.fn()} />
    );
    categories.forEach((cat) => {
      expect(getByText(cat)).toBeTruthy();
    });
  });
});
