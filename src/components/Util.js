const BASE_URL = "https://ik.imagekit.io/bishwarup307/odin-weather/";

// !change this with `window.innerHeight`
const tempHeight = 500;

export function getBackgroundImageUrl({ current }) {
    // console.log(window.innerHeight);
    let url = BASE_URL;
    const timeOfDay = current.is_day ? "day" : "night";
    url += `${timeOfDay}/`;
    const suffix = tempHeight < 768 ? "sm" : "lg";
    const width = tempHeight < 768 ? 401 : 1080;
    url += `${current.condition.text
        .toLowerCase()
        .replaceAll(" ", "-")}-${suffix}.jpeg?tr=w-${width}`;
    return url;
}

export const getSummaryForecast = function getTodaysHighAndLow({ forecast }) {
    return forecast.forecastday[0].day;
};

export const getUnitKey = (key, unit) => {
    if (unit !== "c" && unit !== "f") throw new Error("Unknown unit specified");
    return `${key}_${unit}`;
};