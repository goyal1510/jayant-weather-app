const apiKey = "48118fe8352ed4398205c8db917f6718";

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

// Function to fetch future forecast data by city name
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
  const cityInput = document.getElementById("cityInput");
  cityInput.value = data.name;

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

  currentWeatherElem.className = `${bgColor} text-white p-4 rounded-md transition-transform transition-shadow duration-300 hover:scale-y-110 hover:shadow-lg`;
  currentWeatherElem.innerHTML = `
        <div class="flex justify-between items-center ">
            <div class="flex flex-col">
                <h1 class="text-lg sm:text-2xl md:text-3xl lg:text-3xl font-bold">${
                  data.name
                }</h1>
                <h1 class="text-xs sm:text-lg md:text-xl lg:text-xl">${formatDate(
                  new Date()
                )}</h1>
                <br>
                <p class="text-xs mb-1 sm:text-lg md:text-xl lg:text-xl"">Wind: ${
                  data.wind.speed
                } m/s</p>
                <p class="text-xs sm:text-lg md:text-xl lg:text-xl"">Humidity: ${
                  data.main.humidity
                }%</p>
            </div>
            <div class="text-right">
                <p class="text-xl sm:text-2xl lg:text-4xl md:text-3xl"> ${
                  data.main.temp
                }°C</p>
            </div>
            <div class="flex-col justify-center items-center">
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" class="w-12 h-12 md:w-24 md:h-24 lg:w-30 md:h-30  " title="${description}"/>
                <p class="text-lg text-center">${description}</p>
            </div>
        </div>
    `;
}

// Function to update the 4-day forecast in UI starting from tomorrow
function updateForecastUI(forecastData) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  const today = new Date();
  const nextFourDays = Array.from({ length: 4 }, (_, i) => {
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
        "items-center",
        "transition-transform", // Enable transition for transform
        "transition-shadow", // Enable transition for shadow
        "duration-300", // Set duration for the transition
        "hover:scale-105", // Scale on hover
        "hover:shadow-lg"
      );

      const formattedDate = formatDate(day);

      forecastElem.innerHTML = `
                <p>${formattedDate}</p>
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" class="w-16 h-16 mb-2" title="${description}"/>
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
  cities = cities.filter((c) => c.toLowerCase() !== city.toLowerCase());
  city = city.charAt(0).toUpperCase() + city.slice(1);
  cities.unshift(city); // Add the city to the beginning of the array

  if (cities.length > 10) cities.pop(); // Limit to the last 10 searches

  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateRecentCitiesDropdown();
}

// Update the recent cities dropdown menu
function updateRecentCitiesDropdown() {
  const recentCitiesList = document.getElementById("recentCitiesList");
  recentCitiesList.innerHTML = "";
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (cities.length > 0) {
    // Show the dropdown button with default text
    const dropdownButton = document.getElementById("dropdownButton");
    dropdownButton.querySelector("span").textContent = "Recent Searches";
  }

  cities.forEach((city) => {
    const cityElem = document.createElement("li");
    cityElem.classList.add(
      "px-4",
      "py-2",
      "hover:bg-gray-600",
      "cursor-pointer"
    );
    cityElem.textContent = city;
    cityElem.onclick = async () => {
      const weatherData = await getWeatherByCity(city);
      const forecastData = await get5DayForecastByCity(city);
      const cityInput = document.getElementById("cityInput");
      cityInput.value = city;
      updateWeatherUI(weatherData);
      updateForecastUI(forecastData);
      toggleDropdown(); // Close the dropdown after selection
    };
    recentCitiesList.appendChild(cityElem);
  });

  // If no cities, hide the dropdown
  if (cities.length === 0) {
    const dropdownButton = document.getElementById("dropdownButton");
    dropdownButton.querySelector("span").textContent = "Recent Searches";
  }
  if (cities.length > 0) {
    const dropdownButton = document.getElementById("dropdownButton");
    dropdownButton.classList.remove("hidden");
  }
}

// Toggle the dropdown menu visibility
function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("hidden");
}

// Close the dropdown if clicked outside
window.onclick = function (event) {
  const dropdownButton = document.getElementById("dropdownButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (
    !dropdownButton.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.classList.add("hidden");
  }
};

// Event listeners
document.getElementById("searchBtn").addEventListener("click", async () => {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();
  if (city) {
    const weatherData = await getWeatherByCity(city);
    if (weatherData) {
      const forecastData = await get5DayForecastByCity(city);
      updateWeatherUI(weatherData);
      updateForecastUI(forecastData);
    }
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
      if (weatherData) {
        const forecastData = await get5DayForecastByLocation(lat, lon);
        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
      }
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Fetch weather by location
async function getWeatherByLocation(lat, lon) {
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("Weather data not available");
    const data = await response.json();
    // saveRecentCity(data.name);
    return data;
  } catch (error) {
    alert(error.message);
  }
}

// Fetch forecast by location
async function get5DayForecastByLocation(lat, lon) {
  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("Forecast data not available");
    const data = await response.json();
    return data;
  } catch (error) {
    alert(error.message);
  }
}

// Initialize the recent cities dropdown on page load
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const weatherData = await getWeatherByLocation(lat, lon);
      if (weatherData) {
        const forecastData = await get5DayForecastByLocation(lat, lon);
        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
        updateRecentCitiesDropdown();
      }
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
  updateRecentCitiesDropdown();
};

// Handle dropdown button click
document
  .getElementById("dropdownButton")
  .addEventListener("click", toggleDropdown);
