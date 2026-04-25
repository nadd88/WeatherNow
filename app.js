// ===============================
// TASK 2 : FETCH API WEATHER DATA
// ===============================

// Get HTML elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const weatherCard = document.getElementById("weather-card");
const forecastSection = document.getElementById("forecast-section");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weather-icon");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

// Lookup table for weather codes
const weatherLookup = {
  0:  { text: "Clear Sky",       icon: "☀️"  },
  1:  { text: "Mainly Clear",    icon: "🌤️" },
  2:  { text: "Partly Cloudy",   icon: "⛅"  },
  3:  { text: "Overcast",        icon: "☁️"  },
  61: { text: "Rain",            icon: "🌧️" },
  63: { text: "Moderate Rain",   icon: "🌧️" },
  65: { text: "Heavy Rain",      icon: "🌧️" },
  95: { text: "Thunderstorm",    icon: "⛈️" }
};

// =============================================
// TASK 4 : STEP 1 - Input validation
// Shows a message if input is less than 2 chars
// =============================================
function validateInput(city) {
  if (!city || city.length < 2) {
    alert("Please enter at least 2 characters.");
    return false;
  }
  return true;
}

function populateForecast(data) {
  const row      = document.getElementById("forecast-row");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  row.innerHTML  = "";

  for (let i = 0; i < 7; i++) {
    const date = new Date(data.daily.time[i] + "T00:00:00");
    const day  = dayNames[date.getDay()];
    const code = data.daily.weathercode[i];
    const info = weatherLookup[code] || { text: "Unknown", icon: "❓" };
    const high = data.daily.temperature_2m_max[i].toFixed(0);
    const low  = data.daily.temperature_2m_min[i].toFixed(0);

    row.innerHTML += `
      <div class="forecast-card">
        <p class="fc-day">${day}</p>
        <p class="fc-icon">${info.icon}</p>
        <p class="fc-high">${high}°</p>
        <p class="fc-low">${low}°</p>
      </div>`;
  }
}

// =============================================
// TASK 4 : STEP 2 - AbortController timeout
// Cancels the request if it takes over 10 seconds
// =============================================
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    // Task 4 : Step 3 - HTTP error handling
    if (!response.ok) {
      throw new Error("HTTP Error " + response.status);
    }

    return response;

  } catch (error) {
    clearTimeout(timeoutId);

    // If AbortController cancelled the request
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw error;
  }
}

// =============================================
// TASK 4 : STEP 4 - Debounce
// Waits 500ms after typing stops before searching
// =============================================
let debounceTimer = null;

searchInput.addEventListener("input", function () {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const city = searchInput.value.trim();
    if (validateInput(city)) {
      getWeather();
    }
  }, 500);
});

// Run function when button clicked
searchButton.addEventListener("click", getWeather);

// Main async function
async function getWeather() {

  const city = searchInput.value.trim();

  // Task 4 : validate before making any API call
  if (!validateInput(city)) return;

  try {

    // -----------------------------
    // STEP 1 : GEOCODING API
    // Now uses fetchWithTimeout instead of plain fetch
    // -----------------------------
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

    const geoResponse = await fetchWithTimeout(geoUrl);
    const geoData = await geoResponse.json();

    // If no city found — show error in UI, do NOT throw
    if (!geoData.results || geoData.results.length === 0) {
      cityName.textContent = "City not found";
      return;
    }

    const lat  = geoData.results[0].latitude;
    const lon  = geoData.results[0].longitude;
    const name = geoData.results[0].name;

    // -----------------------------
    // STEP 2 : WEATHER API
    // Now uses fetchWithTimeout instead of plain fetch
    // -----------------------------
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const weatherResponse = await fetchWithTimeout(weatherUrl);
    const weatherData = await weatherResponse.json();

    const code = weatherData.current_weather.weathercode;
    const info = weatherLookup[code] || { text: "Unknown", icon: "❓" };

    weatherCard.classList.remove("hidden");
    forecastSection.classList.remove("hidden");

    cityName.textContent     = name;
    temperature.textContent  = weatherData.current_weather.temperature + "°C";
    description.textContent  = info.text;
    weatherIcon.textContent  = info.icon;

    getLocalTime(weatherData.timezone);
    populateForecast(weatherData);

    humidity.textContent  = "Humidity: "    + weatherData.hourly.relativehumidity_2m[0] + "%";
    windSpeed.textContent = "Wind Speed: "  + weatherData.current_weather.windspeed + " km/h";

  } catch (error) {
    alert("Error: " + error.message);
  }
}

// ===================================
// TASK 3 : JQUERY AJAX LOCAL TIME API
// ===================================

function getLocalTime(timezone) {

  $.getJSON(`https://worldtimeapi.org/api/timezone/${timezone}`)

    .done(function (data) {
      $("#local-time").text(
        "Local Time: " + new Date(data.datetime).toLocaleTimeString()
      );
    })

    .fail(function () {
      $("#local-time").text(
        "Local Time: " + new Date().toLocaleTimeString()
      );
    })

    .always(function () {
      console.log("Time API request completed:", new Date());
    });
}