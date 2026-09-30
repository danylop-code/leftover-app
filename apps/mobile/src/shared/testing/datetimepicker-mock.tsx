// Jest stand-in for @react-native-community/datetimepicker (registered in jest.setup.ts): a View
// that keeps its props, so tests can fire `change`, and a recorded Android dialog opener.
import { View, type ViewProps } from 'react-native';

export const DateTimePickerAndroid = { open: jest.fn(), dismiss: jest.fn() };

export default function DateTimePicker(props: ViewProps) {
  return <View {...props} />;
}
