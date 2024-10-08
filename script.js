const apiKey = "48118fe8352ed4398205c8db917f6718"; // Replace with your actual API key

// Function to fetch current weather data by city name
async function getWeatherByCity(city) {
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    saveRecentCity(city);
    return data;
  } catch (error) {
    alert(error.message);
  }
}

// Function to fetch 5-day forecast data by city name
async function get5DayForecastByCity(city) {
  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("Forecast not available");
    const data = await response.json();
    return data;
  } catch (error) {
    alert(error.message);
  }
}

// Function to update current weather in UI
function updateWeatherUI(data) {
  const currentWeatherElem = document.getElementById("currentWeather");
  const iconCode = data.weather[0].icon;
  const description =
    data.weather[0].description.charAt(0).toUpperCase() +
    data.weather[0].description.slice(1);
  // const cityInput = document.getElementById("cityInput");
  // cityInput.value = data.name;

  let bgColor;
  if (description.includes("cloud")) {
    bgColor = "bg-gray-400";
  } else if (description.includes("rain")) {
    bgColor = "bg-blue-500";
  } else if (description.includes("clear")) {
    bgColor = "bg-yellow-300";
  } else {
    bgColor = "bg-blue-500";
  }

  currentWeatherElem.className = `${bgColor} text-white p-4 rounded-md`;
  // currentWeatherElem.className = `text-white p-4 rounded-md`;
  currentWeatherElem.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold">${data.name}</h1>
          <h1 class="text-lg">${formatDate(new Date())}</h1>
          <br>
          <p>Wind: ${data.wind.speed} m/s</p>
          <p>Humidity: ${data.main.humidity}%</p>

        </div>
        <div class="text-right">
          <p class="text-5xl"> ${data.main.temp}°C</p>
        </div>
        <div>
          <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" class="w-30 h-30" title="${description}"/>
          <p class="text-xl text-center">${description}</p>
        </div>
      </div>
    `;
}

// Function to update the 4-day forecast in UI starting from tomorrow
function updateForecastUI(forecastData) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  const today = new Date();
  const nextFourDays = Array.from({ length: 5 }, (_, i) => {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i + 1);
    return nextDay;
  });

  const dailyForecasts = forecastData.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  nextFourDays.forEach((day) => {
    const forecast = dailyForecasts.find(
      (forecast) =>
        forecast.dt_txt.split(" ")[0] === day.toISOString().split("T")[0]
    );

    if (forecast) {
      const forecastElem = document.createElement("div");

      const iconCode = forecast.weather[0].icon;
      const description = forecast.weather[0].description;

      let bgColor;
      if (description.includes("cloud")) {
        bgColor = "bg-gray-400";
      } else if (description.includes("rain")) {
        bgColor = "bg-blue-500";
      } else if (description.includes("clear")) {
        bgColor = "bg-yellow-300";
      } else {
        bgColor = "bg-blue-200";
      }

      forecastElem.classList.add(
        bgColor,
        "p-2",
        "rounded-md",
        "text-center",
        "flex",
        "flex-col",
        "items-center"
      );

      const formattedDate = formatDate(day);

      forecastElem.innerHTML = `
        <p>${formattedDate}</p>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" class="w-12 h-12 mb-2" title="${description}"/>
        <p>Temp: ${forecast.main.temp}°C</p>
        <p>Wind: ${forecast.wind.speed} m/s</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      `;

      forecastContainer.appendChild(forecastElem);
    }
  });
}

function formatDate(date) {
  const day = date.getDate();
  const suffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${suffix(day)} ${date.toLocaleString("default", {
    month: "short",
  })} ${date.getFullYear()}`;
}

// Save city to localStorage and update recent cities dropdown
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Remove city if it already exists in the array, then add it to the beginning
  cities = cities.filter((c) => c !== city);
  cities.unshift(city); // Add the city to the beginning of the array

  if (cities.length > 10) cities.pop(); // Limit to the last 5 searches

  localStorage.setItem("recentCities", JSON.stringify(cities));
  if (cities.length >= 1) {
    recentButton.classList.remove("hidden");
  }
  updateRecentCitiesDropdown();
}

// Update the recent cities dropdown menu
function updateRecentCitiesDropdown() {
  const recentCitiesElem = document.getElementById("recentCities");
  recentCitiesElem.innerHTML = "";
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (cities.length >= 1) {
    recentButton.classList.remove("hidden");
  }
  cities.forEach((city) => {
    const cityElem = document.createElement("button");
    cityElem.classList.add(
      "block",
      "px-4",
      "py-2",
      "hover:bg-gray-200",
      "w-full",
      "text-left"
    );
    cityElem.textContent = city;
    cityElem.onclick = async () => {
      const weatherData = await getWeatherByCity(city);
      const forecastData = await get5DayForecastByCity(city);
      const cityInput = document.getElementById("cityInput");
      cityInput.value = city;
      updateWeatherUI(weatherData);
      updateForecastUI(forecastData);
      hideRecentCities();
    };
    recentCitiesElem.appendChild(cityElem);
  });
}

// Event listeners
document.getElementById("searchBtn").addEventListener("click", async () => {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value;
  if (city) {
    const weatherData = await getWeatherByCity(city);
    const forecastData = await get5DayForecastByCity(city);
    updateWeatherUI(weatherData);
    updateForecastUI(forecastData);
  } else {
    alert("Please enter a valid city name");
  }
});

document.getElementById("currentLocationBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const weatherData = await getWeatherByLocation(lat, lon);
      const forecastData = await get5DayForecastByLocation(lat, lon);
      updateWeatherUI(weatherData);
      updateForecastUI(forecastData);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

async function getWeatherByLocation(lat, lon) {
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await fetch(apiURL);
  return await response.json();
}

async function get5DayForecastByLocation(lat, lon) {
  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await fetch(apiURL);
  return await response.json();
}

const recentButton = document.getElementById("recentBtn");
const recentCitiesElem1 = document.getElementById("recentCities");

recentButton.addEventListener("click", () => {
  recentCitiesElem1.style.display = "block";
  document.addEventListener("click", handleClickOutside);
});

function hideRecentCities() {
  recentCitiesElem1.style.display = "none";
  document.removeEventListener("click", handleClickOutside);
}

function handleClickOutside(event) {
  if (
    !recentCitiesElem1.contains(event.target) &&
    !recentButton.contains(event.target)
  ) {
    hideRecentCities();
  }
}

// Automatically fetch and display the current location's weather on page load
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const weatherData = await getWeatherByLocation(lat, lon);
      const forecastData = await get5DayForecastByLocation(lat, lon);
      updateWeatherUI(weatherData);
      updateForecastUI(forecastData);
      // Initialize the recent cities dropdown on page load
      updateRecentCitiesDropdown();
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

// Initialize the recent cities dropdown on page load
updateRecentCitiesDropdown();
