import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { color } from '../../theme';
import { Field } from './Field';
import { Input } from './Input';

describe('Field', () => {
  it('labels its input', () => {
    render(
      <Field label="Email">
        <Input value="" onChangeText={jest.fn()} />
      </Field>,
    );
    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
  });

  it('shows help text when there is no error', () => {
    render(
      <Field label="Password" help="At least 8 characters">
        <Input value="" onChangeText={jest.fn()} />
      </Field>,
    );
    expect(screen.getByText('At least 8 characters')).toBeOnTheScreen();
  });

  it('replaces help with the error and puts the input in the error state', () => {
    render(
      <Field label="Sale price" help="In hryvnias" error="Must be lower than the original price">
        <Input value="500" onChangeText={jest.fn()} />
      </Field>,
    );
    expect(screen.getByText('Must be lower than the original price')).toBeOnTheScreen();
    expect(screen.queryByText('In hryvnias')).toBeNull();
    expect(screen.getByTestId('input-wrap')).toHaveStyle({ borderColor: color.danger });
  });

  it('shows a counter and turns it to the error state over the limit', () => {
    const { rerender } = render(
      <Field label="Message" count={12} maxCount={500}>
        <Input value="" onChangeText={jest.fn()} />
      </Field>,
    );
    expect(screen.getByText('12/500')).toHaveStyle({ color: color.textSecondary });
    rerender(
      <Field label="Message" count={501} maxCount={500}>
        <Input value="" onChangeText={jest.fn()} />
      </Field>,
    );
    expect(screen.getByText('501/500')).toHaveStyle({ color: color.danger });
  });

  it('marks optional fields', () => {
    render(
      <Field label="Message" optional>
        <Input value="" onChangeText={jest.fn()} />
      </Field>,
    );
    expect(screen.getByText('Optional')).toBeOnTheScreen();
  });

  it('keeps single-line text vertically centred beside its icon (no lineHeight on iOS)', () => {
    render(
      <Field label="Email">
        <Input icon="mail" value="olena@example.com" onChangeText={jest.fn()} />
      </Field>,
    );
    const style = StyleSheet.flatten(screen.getByLabelText('Email').props.style);
    expect(style.lineHeight).toBeUndefined();
    expect(style.fontSize).toBe(16);
  });
});
