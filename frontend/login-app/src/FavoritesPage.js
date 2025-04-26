import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // reuse Navbar

const FavoritePage = () => {
  const [favorites, setFavorites] = useState([]);
  const [cityData, setCityData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      const favs = JSON.parse(saved);
      setFavorites(favs);
      fetchCityTemperatures(favs); // 👈 Fetch temperatures
    }
  }, []);

  const fetchCityTemperatures = async (cities) => {
    try {
      const promises = cities.map(async (city) => {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude, timezone } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=${timezone}`);
          const weatherData = await weatherRes.json();
          const temp = weatherData.current.temperature_2m;
          return { city, temp };
        } else {
          return { city, temp: 'N/A' };
        }
      });

      const results = await Promise.all(promises);
      setCityData(results);
    } catch (err) {
      console.error('Error fetching temperatures:', err);
    }
  };

  const removeFavorite = (city) => {
    const updatedFavorites = favorites.filter(fav => fav !== city);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

    const updatedCityData = cityData.filter(item => item.city !== city);
    setCityData(updatedCityData);
  };

  return (
    <div>
      <Navbar />
      <h1 style={{ fontSize: '22px', marginTop: '20px' }}>My Favorite Cities</h1>
      <ul style={{ fontSize: '16px', padding: '0 20px' }}>
        {cityData.length === 0 ? (
          <p>No favorites yet.</p>
        ) : (
          cityData.map((item, idx) => (
            <li 
              key={idx} 
              style={{ 
                marginBottom: '10px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: '#f9f9f9', 
                padding: '10px', 
                borderRadius: '8px' 
              }}
            >
              <span>
                {item.city} - {item.temp !== 'N/A' ? `${Math.round(item.temp)}°C` : 'Temperature not available'}
              </span>
              <span 
                onClick={() => removeFavorite(item.city)}
                style={{ 
                  fontSize: '18px', 
                  color: '#ff4d4d', 
                  cursor: 'pointer', 
                  padding: '4px' 
                }}
                title="Remove"
              >
                ❌
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FavoritePage;
