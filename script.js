
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const message = document.getElementById("message");
const result = document.getElementById("weather-result");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const description = document.getElementById("description");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

// Convert weather codes into descriptions and icons.
function getWeatherInfo(code) {
    if (code === 0) return ["Clear sky", "☀️"];
    if (code === 1) return ["Mainly clear", "🌤️"];
    if (code === 2) return ["Partly cloudy", "⛅"];
    if (code === 3) return ["Overcast", "☁️"];

    if ([45, 48].includes(code)) {
        return ["Foggy", "🌫️"];
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return ["Drizzle", "🌦️"];
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return ["Rainy", "🌧️"];
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return ["Snowy", "❄️"];
    }

    if ([95, 96, 99].includes(code)) {
        return ["Thunderstorm", "⛈️"];
    }

    return ["Unknown conditions", "🌡️"];
}

async function getWeather(city) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    message.textContent = "Fetching weather...";
    result.hidden = true;

    try {
        // Step 1: Find the city coordinates.
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Could not search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling.");
        }

        const place = geoData.results[0];
        const latitude = place.latitude;
        const longitude = place.longitude;

        // Step 2: Get current weather using coordinates.
        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${latitude}&longitude=${longitude}` +
            "&current=temperature_2m,relative_humidity_2m," +
            "wind_speed_10m,weather_code&timezone=auto";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Could not fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        if (!current) {
            throw new Error("Weather information is unavailable.");
        }

        // Step 3: Display the weather.
        const [weatherText, icon] =
            getWeatherInfo(current.weather_code);

        cityName.textContent = [place.name, place.admin1, place.country]
            .filter(Boolean)
            .filter((value, index, array) =>
                array.indexOf(value) === index
            )
            .join(", ");

        weatherIcon.textContent = icon;
        description.textContent = weatherText;
        temperature.textContent = Math.round(
            current.temperature_2m
        );
        humidity.textContent =
            current.relative_humidity_2m + "%";
        wind.textContent = current.wind_speed_10m + " km/h";

        result.hidden = false;
        message.textContent = "Weather updated successfully!";
    } catch (error) {
        message.textContent =
            error.message ||
            "Something went wrong. Please try again.";
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

// Run the app when the user submits the form.
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});
