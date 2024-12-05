import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Vehicle } from '../types/vehicle';

export function useVehicles(initialCategory: string = 'all') {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        setLoading(true);
        let files = [];
        
        switch (selectedCategory) {
          case 'fighter':
            files = ['data/russian_fighters.csv'];
            break;
          case 'helicopter':
            files = ['data/russian_helicopters.csv'];
            break;
          case 'transport':
            files = ['data/russian_transport_aircraft.csv'];
            break;
          default:
            files = [
              'data/russian_fighters.csv',
              'data/russian_helicopters.csv',
              'data/russian_transport_aircraft.csv'
            ];
        }

        const allVehicles = [];

        for (const file of files) {
          const response = await window.fs.readFile(file, { encoding: 'utf8' });
          const category = file.includes('fighters') ? 'fighter' :
                          file.includes('helicopters') ? 'helicopter' : 'transport';

          const result = await new Promise((resolve, reject) => {
            Papa.parse(response, {
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: (results) => {
                const vehiclesWithCategory = results.data.map(vehicle => ({
                  ...vehicle,
                  category
                }));
                resolve(vehiclesWithCategory);
              },
              error: reject
            });
          });

          allVehicles.push(...result);
        }

        setVehicles(allVehicles);
        setError(null);
      } catch (err) {
        console.error('Error loading vehicles:', err);
        setError('Failed to load vehicles data');
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, [selectedCategory]);

  return {
    vehicles,
    selectedCategory,
    setSelectedCategory,
    error,
    loading
  };
}