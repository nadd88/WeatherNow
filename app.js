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
// Converts API numbers into readable text + emoji
const weatherLookup = {
  0: { text: "Clear Sky", icon: "☀️" },
  1: { text: "Mainly Clear", icon: "🌤️" },
  2: { text: "Partly Cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  61: { text: "Rain", icon: "🌧️" },
  63: { text: "Moderate Rain", icon: "🌧️" },
  65: { text: "Heavy Rain", icon: "🌧️" },
  95: { text: "Thunderstorm", icon: "⛈️" }
};

// Run function when button clicked
searchButton.addEventListener("click", getWeather);

// Main async function
async function getWeather() {

  // Remove spaces from user input
  const city = searchInput.value.trim();

  try {

    // -----------------------------
    // STEP 1 : GEOCODING API
    // Converts city into lat + lon
    // -----------------------------
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

    const geoResponse = await fetch(geoUrl);

    // Handle HTTP errors
    if (!geoResponse.ok) {
      throw new Error("HTTP Error " + geoResponse.status);
    }

    const geoData = await geoResponse.json();

    // If no city found
    if (!geoData.results || geoData.results.length === 0) {
      cityName.textContent = "City not found";
      return;
    }

    // Extract city coordinates
    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;
    const name = geoData.results[0].name;

    // -----------------------------
    // STEP 2 : WEATHER API
    // -----------------------------
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("HTTP Error " + weatherResponse.status);
    }

    const weatherData = await weatherResponse.json();

    // Get weather code from API
    const code = weatherData.current_weather.weathercode;

    // Convert code using lookup table
    const info = weatherLookup[code] || {
      text: "Unknown",
      icon: "❓"
    };

    // Show hidden sections
    weatherCard.classList.remove("hidden");
    forecastSection.classList.remove("hidden");

    // Display data in UI
    cityName.textContent = name;
    temperature.textContent =
      weatherData.current_weather.temperature + "°C";

    description.textContent = info.text;
    weatherIcon.textContent = info.icon;

    getLocalTime(weatherData.timezone);
    
    humidity.textContent =
      "Humidity: " +
      weatherData.hourly.relativehumidity_2m[0] +
      "%";

    windSpeed.textContent =
      "Wind Speed: " +
      weatherData.current_weather.windspeed +
      " km/h";

  } catch (error) {

    // Network or HTTP errors
    alert("Error: " + error.message);
  }
}

// ===================================
// TASK 3 : JQUERY AJAX LOCAL TIME API
// ===================================

// Function to get time using timezone
function getLocalTime(timezone) {

  $.getJSON(`https://worldtimeapi.org/api/timezone/${timezone}`)

    // If request successful
    .done(function (data) {

      $("#local-time").text(
        "Local Time: " +
        new Date(data.datetime).toLocaleTimeString()
      );
    })

    // If request fails
    .fail(function () {

      // Use browser local time
      $("#local-time").text(
        "Local Time: " +
        new Date().toLocaleTimeString()
      );
    })

    // Runs always (success or fail)
    .always(function () {

      console.log(
        "Time API request completed:",
        new Date()
      );
    });
}