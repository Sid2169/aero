import logoPng from "../assets/logo.png";

function requestUserLocation() {
    return new Promise((resolve, reject) => {
        const successCallback = (position) => {
            resolve(position);
        };

        const errorCallback = (error) => {
            reject(error);
        };

        navigator.geolocation.getCurrentPosition(
            successCallback,
            errorCallback
        );
    });
}

export default async function getWeather(location) {
    let deviceLocationCoords;

    try {
        const deviceLocation = await requestUserLocation();
        deviceLocationCoords = `${deviceLocation.coords.latitude},${deviceLocation.coords.longitude}`;
    } catch (error) {
        deviceLocationCoords = null;
    }

    const searchLocation = location || deviceLocationCoords || "Darjeeling";

    const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${process.env.API_KEY}&q=${searchLocation}`
    );
    const data = await response.json();
    const weatherData = await data;
    return weatherData;
}

export async function getAutoCompleteResults(searchTerm) {
    const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${process.env.API_KEY}&q=${searchTerm}`
    );
    const data = await response.json();
    const results = await data;
    return results;
}