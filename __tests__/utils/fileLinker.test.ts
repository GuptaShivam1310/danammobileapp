import { Alert, Linking } from 'react-native';
import { openFile } from '../../src/utils/fileLinker';

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

describe('openFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens url when platform supports it', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

    await openFile('https://example.com/a.pdf', 'a.pdf');

    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com/a.pdf');
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/a.pdf');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('opens local file:// uri even when canOpenURL is false', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    await openFile('file:///tmp/test.pdf', 'test.pdf');

    expect(Linking.openURL).toHaveBeenCalledWith('file:///tmp/test.pdf');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('shows unsupported alert when file cannot be opened', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    await openFile('foo://bar', 'bar.foo');

    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Unsupported File',
      'Device cannot open this file type: bar.foo',
    );
  });

  it('shows error alert when open throws', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockRejectedValue(new Error('boom'));

    await openFile('https://example.com/fail.pdf', 'fail.pdf');

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Could not open the file. Make sure you have an app that can handle this file type.',
    );
    spy.mockRestore();
  });
});
