import React from 'react';
import NearbyWorkers from './NearbyWorkers';
import HiredWorkers from './HiredWorkers';

const ManageWorkers = ({ profile, initialTab = 'nearby', onTabChange }) => {
  const handleTabChange = (newTab) => {
    if (onTabChange) {
      onTabChange(newTab);
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleTabChange('nearby')}
          className={`px-4 py-2 rounded font-semibold ${initialTab === 'nearby' ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Nearby Workers
        </button>
        <button
          onClick={() => handleTabChange('hired')}
          className={`px-4 py-2 rounded font-semibold ${initialTab === 'hired' ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Hired Workers
        </button>
      </div>

      <div>
        {initialTab === 'nearby' && <NearbyWorkers profile={profile} />}
        {initialTab === 'hired' && <HiredWorkers />}
      </div>
    </div>
  );
};

export default ManageWorkers;
