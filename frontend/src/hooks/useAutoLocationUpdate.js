import { useEffect, useState, useCallback } from 'react';
import { getCurrentLocation } from '../utils/geolocation';
import { WorkerService, EmployerService } from '../services/api';
import { showSuccess, showError } from '../utils/toastNotification';

export const useAutoLocationUpdate = (role) => {
  const [locationUpdated, setLocationUpdated] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateLocationInternal = useCallback(async () => {
    if (loading || locationUpdated) return;

    try {
      setLoading(true);
      const location = await getCurrentLocation();
      const service = role === 'worker' ? WorkerService : EmployerService;
      
      await service.updateLocation(location.latitude, location.longitude);
      
      showSuccess(`Location updated successfully`);
      setLocationUpdated(true);
    } catch (error) {
      console.error('Error updating location:', error);
      // Don't show error for geolocation denied - user might have disabled it
      if (error.code !== 1) {
        showError('Failed to update location automatically');
      }
    } finally {
      setLoading(false);
    }
  }, [role, loading, locationUpdated]);

  return { updateLocationInternal, locationUpdated, loading };
};
