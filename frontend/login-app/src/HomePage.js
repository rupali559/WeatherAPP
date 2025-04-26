import React, { useState } from 'react';
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Import Navbar
import './App.css';

const HomePage = () => {
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [toastMessage, setToastMessage] = useState(''); // ✅ New state for popup
  const navigate = useNavigate();

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500); // Toast disappears after 2.5 seconds
  };

  const autocompleteCity = async (e) => {
    const input = e.target.value.trim();
    setCityInput(input);
    setSuggestions([]);

    if (input.length < 2) return;

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input)}&count=5`);
      const data = await res.json();
      if (data.results) setSuggestions(data.results);
    } catch (err) {
      console.error('Autocomplete error:', err);
    }
  };

  const getWeather = async () => {
    setForecast(null);
    setHourlyData([]);

    const cityName = cityInput.split(',')[0];

    if (!cityInput) return;

    try {
      let geo;
      if (selectedCity && selectedCity.name.toLowerCase() === cityName.toLowerCase()) {
        geo = selectedCity;
      } else {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) return;
        geo = geoData.results[0];
      }

      const { latitude, longitude, name, country, timezone } = geo;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&hourly=temperature_2m,apparent_temperature,weathercode,wind_speed_10m&timezone=${timezone}`;
      const weatherRes = await fetch(url);
      const data = await weatherRes.json();

      const dateObj = new Date();
      const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' });

      const forecastData = {
        name,
        country,
        dateStr,
        current: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
        wind: Math.round(data.current.wind_speed_10m),
      };

      setForecast(forecastData);

      const now = new Date();
      const today = data.daily.time[0];
      const allHours = data.hourly.time.map((t, i) => ({
        time: t,
        temp: data.hourly.temperature_2m[i],
        feels: data.hourly.apparent_temperature[i],
        code: data.hourly.weathercode[i],
      }));

      const fromNow = allHours.filter(h => new Date(h.time) >= now && h.time.startsWith(today)).slice(0, 24);
      setHourlyData(fromNow);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollHourly = (direction) => {
    const container = document.getElementById('hourScrollContainer');
    const scrollAmount = 150;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if ([1, 2].includes(code)) return '🌤️';
    if (code === 3) return '☁️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55].includes(code)) return '🌦️';
    if ([61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
    if ([66, 67].includes(code)) return '🌧️';
    if ([71, 73, 75, 77].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '';
  };

  const handleFavoriteToggle = (cityName) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFav = savedFavorites.includes(cityName);
    let updatedFavorites;

    if (isFav) {
      updatedFavorites = savedFavorites.filter(c => c !== cityName);
      showToast(`Removed ${cityName} from favorites ❌`);
    } else {
      updatedFavorites = [...savedFavorites, cityName];
      showToast(`Added ${cityName} to favorites ❤️`);
    }

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const isFavorite = (cityName) => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return savedFavorites.includes(cityName);
  };

  return (
    <div className="app">
      <Navbar />

      <h1 style={{ fontSize: '22px' }}>Weather Forecast</h1>
      <input type="text" value={cityInput} onChange={autocompleteCity} placeholder="Enter city name" />
      <ul>
        {suggestions.map((city, i) => (
          <li
            key={i}
            onClick={() => {
              setCityInput(`${city.name}, ${city.country}`);
              setSuggestions([]);
              setSelectedCity(city);
              getWeather();
            }}
            style={{ cursor: 'pointer' }}
          >
            {city.name}, {city.country}
          </li>
        ))}
      </ul>
      <button onClick={getWeather}>Search</button>

      {forecast && (
        <div className="forecast">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '500' }}>{forecast.name}, {forecast.country}</h2>
            <button
              onClick={() => handleFavoriteToggle(forecast.name)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', width: '10px' }}
              title={isFavorite(forecast.name) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite(forecast.name) ? <MdFavorite size={22} color="red" /> : <MdFavoriteBorder size={22} />}
            </button>
          </div>

          <div className="day" style={{ fontSize: '15px' }}>
            {forecast.dateStr}<br />
            {forecast.current}°C • Feels like {forecast.feelsLike}°<br />
            Wind: {forecast.wind} km/h<br />
            High: {forecast.high}° • Low: {forecast.low}°
            <div style={{ fontSize: '24px', marginTop: '6px' }}>{getWeatherIcon(hourlyData[0]?.code)}</div>
          </div>
        </div>
      )}

      {hourlyData.length > 0 && (
        <div className="hourly">
          <h3 style={{ fontSize: '16px' }}>Hourly Forecast</h3>
          <div className="hourly-wrapper">
            <button className="scroll-btn" onClick={() => scrollHourly(-1)}>&#8592;</button>
            <div id="hourScrollContainer" className="hour-scroll">
              {hourlyData.map((h, i) => {
                const hourDate = new Date(h.time);
                const hourLabel = i === 0 ? 'Now' : hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                const icon = getWeatherIcon(h.code);
                return (
                  <div key={i} className={`hour-box${i === 0 ? ' now' : ''}`}>
                    <div className="hour-label">{hourLabel}</div>
                    <div className="hour-icon">{icon}</div>
                    <div className="hour-temp">{Math.round(h.temp)}°</div>
                    <div className="hour-feels">Feels {Math.round(h.feels)}°</div>
                  </div>
                );
              })}
            </div>
            <button className="scroll-btn" onClick={() => scrollHourly(1)}>&#8594;</button>
          </div>
        </div>
      )}

      {/* ✅ Popup (Toast) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'red',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: 9999
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default HomePage;
