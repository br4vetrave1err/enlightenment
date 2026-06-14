import { useState, useEffect } from 'react';
import { Dimensions, Orientation } from 'react-native';

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>(
    Dimensions.get('window').width > Dimensions.get('window').height
      ? Orientation.LANDSCAPE
      : Orientation.PORTRAIT
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(
        window.width > window.height ? Orientation.LANDSCAPE : Orientation.PORTRAIT
      );
    });

    return () => subscription?.remove();
  }, []);

  return orientation;
}
