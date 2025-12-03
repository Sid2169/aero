import aqiData from "../data/aqidata.json";

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

function calculateAqiForPollutant(pollutantName, pollutantLevel) {
    // console.log(pollutantName, pollutantLevel);
    if (pollutantName === "co") {
        pollutantLevel /= 1000;
    }
    const currentRange = aqiData.filter(
        (rng) =>
            rng[pollutantName].low < pollutantLevel &&
            rng[pollutantName].high >= pollutantLevel
    )[0];
    // console.log(currentRange);

    const aqi =
        ((currentRange.aqiRange.high - currentRange.aqiRange.low) /
            (currentRange[pollutantName].high -
                currentRange[pollutantName].low)) *
            (pollutantLevel - currentRange[pollutantName].low) +
        currentRange.aqiRange.low;
    return aqi;
}

export function calculateAqi(record) {
    const aqiLevels = [];
    ["pm2_5", "pm10", "co", "no2", "o3", "so2"].forEach((element) => {
        if (record[element]) {
            aqiLevels.push(calculateAqiForPollutant(element, record[element]));
        }
    });
    const aqi = Math.max(...aqiLevels);
    return Math.round(aqi);
}

export function airQualityLabel(aqi) {
    if (aqi <= 50)
        return { label: "Good", description: "Minimal impact on health" };
    if (aqi <= 100)
        return {
            label: "Satisfactory",
            description: "Minor breathing discomfort to sensitive people",
        };
    if (aqi <= 200)
        return {
            label: "Moderate",
            description:
                "Breathing discomfort to the people with lung, heart disease, children and older adults",
        };
    if (aqi <= 300)
        return {
            label: "Poor",
            description: "Breathing discomfort to people on prolonged exposure",
        };
    if (aqi <= 400)
        return {
            label: "Very Poor",
            description:
                "Respiratory illness to the people on prolonged exposure",
        };
    return {
        label: "Severe",
        description: "Respiratory effects even on healthy people",
    };
}