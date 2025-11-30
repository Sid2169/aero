import logoPng from "../assets/logo.png";

export default function Container() {
    const container = document.createElement("div");
    container.className =
        "container flex justify-center items-center gap-4 bg-slate-800 mt-16 h-[80vh] text-6xl rounded-3xl shadow-2xl";

    getWeather().then((weather) => {
        console.log(weather);
    });
    return container;
}

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

async function getWeather(location) {
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
    const weatherType = await data.location;
    return weatherType;
}