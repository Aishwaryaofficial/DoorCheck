import Geolocation from '@react-native-community/geolocation';
import {Platform, PermissionsAndroid} from 'react-native';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  enableBackgroundLocationUpdates: false,
  locationProvider: 'auto',
});

async function androidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'DoorCheck location',
      message: 'DoorCheck uses where you are to check weather and air quality.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function getCurrentCoords(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const ok = await androidPermission();
  if (!ok) {
    throw new Error('Location permission denied');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(new Error(error.message || 'Could not read GPS'));
      },
      {enableHighAccuracy: false, timeout: 12000, maximumAge: 60000},
    );
  });
}
