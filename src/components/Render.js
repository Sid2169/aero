import dayjs from "dayjs";
import loadingAnimation from "../assets/loading.gif";
import getWeather from "./WeatherApi";
import iconPack from "./Icon";
import { getBackgroundImageUrl, getSummaryForecast, getUnitKey } from "./Util";

const UNIT_SUFFIX = "c";

const getIcon = ({ current }) => {
    let iconKey = current.condition.text.toLowerCase().replaceAll(" ", "-");
    iconKey = current.is_day ? (iconKey += "-d") : (iconKey += "-n");
    return iconPack[iconKey];
};

const hourlyDisplay = function hourlyInformationDisplay({ forecast }) {
    const hourlyForecastDiv = document.createElement("div");
    hourlyForecastDiv.id = "hourly-forecast";
    hourlyForecastDiv.className =
        "hourly-forecast-display flex gap-10 rounded-lg px-4 py-2 overflow-x-scroll backdrop-blur-sm backdrop-brightness-[.8]";

    const hourlyData = forecast.forecastday[0].hour;
    hourlyData.forEach((hour) => {
        // console.log(dayjs(hour.time).format("h A"));
        let iconKey = hour.condition.text.toLowerCase().trim();
        iconKey += hour.is_day ? "-d" : "-n";
        // console.log(iconKey);

        const card = document.createElement("div");
        card.className = "flex flex-col gap-2";
        // card.id = dayjs(hour.time).format("h A");

        const time = document.createElement("p");
        time.className = "text-white text-xs whitespace-nowrap";
        time.textContent = dayjs(hour.time).format("h A");

        const icon = document.createElement("div");
        icon.className = "fill-slate-50 stroke-slate-50 h-10 w-10";
        icon.innerHTML = iconPack[iconKey];

        const temp = document.createElement("p");
        temp.className = "text-white text-xs whitespace-nowrap";
        const currentTemp = Math.round(hour[getUnitKey("temp", UNIT_SUFFIX)]);
        temp.innerHTML = `${currentTemp} &deg${UNIT_SUFFIX.toUpperCase()}`;

        card.appendChild(time);
        card.appendChild(icon);
        card.appendChild(temp);

        hourlyForecastDiv.appendChild(card);
    });

    return hourlyForecastDiv;
};

const displayCurrentWeather = function displayCurrentWeaterInformation(data) {
    const todaysSummary = getSummaryForecast(data);

    const container = document.createElement("div");
    container.className = "grid grid-cols-1 px-2 pt-8 rounded-lg ";

    // Div for locaiton, date and time display
    const localeDiv = document.createElement("div");
    localeDiv.className = "flex justify-between";

    const locationDiv = document.createElement("div");
    locationDiv.className = "flex items-start gap-2";
    const locIcon = document.createElement("div");
    locIcon.className = "w-4 h-4 fill-slate-100";
    locIcon.innerHTML = iconPack.location;
    locationDiv.appendChild(locIcon);
    const locationText = document.createElement("p");
    locationText.textContent = `${data.location.name}, ${data.location.country}`;
    locationText.className = "text-slate-100 text-sm";
    locationDiv.appendChild(locationText);
    localeDiv.appendChild(locationDiv);

    const dateTimeDiv = document.createElement("div");
    dateTimeDiv.className = "flex flex-col";

    const dateDiv = document.createElement("div");
    dateDiv.className = "flex text-white text-xs ps-6";
    const dayOfWeek = dayjs().format("dddd");
    const date = dayjs().format("D MMM, YYYY");
    dateDiv.textContent = `${dayOfWeek} | ${date}`;
    dateTimeDiv.appendChild(dateDiv);

    const timeDiv = document.createElement("div");
    timeDiv.textContent = dayjs().format("h:m a");
    timeDiv.className = "text-white text-xs ps-6";
    dateTimeDiv.appendChild(timeDiv);
    localeDiv.appendChild(dateTimeDiv);
    container.appendChild(localeDiv);

    // Div containing primary weather information
    const primaryInformationDiv = document.createElement("div");
    primaryInformationDiv.className =
        "flex flex-col gap-1 justify-center items-center py-12";

    const currentDiv = document.createElement("div");
    currentDiv.className = "flex gap-1 justify-center items-center";

    const iconDiv = document.createElement("div");
    const weatherIcon = getIcon(data);
    iconDiv.innerHTML = weatherIcon;
    iconDiv.className = "w-36 h-36 fill-white";
    currentDiv.appendChild(iconDiv);

    const textDiv = document.createElement("div");
    textDiv.className = "flex flex-col";

    const currentTemp = document.createElement("p");
    currentTemp.className = "text-white font-medium text-6xl";
    currentTemp.textContent = Math.round(
        data.current[getUnitKey("temp", UNIT_SUFFIX)]
    );
    const tempUnitSpan = document.createElement("span");
    tempUnitSpan.innerHTML = "  &degC";
    tempUnitSpan.className = "text-white font-medium text-2xl";
    currentTemp.appendChild(tempUnitSpan);
    textDiv.appendChild(currentTemp);

    const weatherText = document.createElement("p");
    weatherText.textContent = data.current.condition.text;
    weatherText.className = "text-white font-light text-2xl";
    textDiv.appendChild(weatherText);
    currentDiv.appendChild(textDiv);
    primaryInformationDiv.appendChild(currentDiv);

    const highLowTemp = document.createElement("p");
    highLowTemp.className = "text-white";
    const todaysHigh = Math.round(
        todaysSummary[getUnitKey("maxtemp", UNIT_SUFFIX)]
    );
    const todaysLow = Math.round(
        todaysSummary[getUnitKey("mintemp", UNIT_SUFFIX)]
    );
    highLowTemp.innerHTML = `High: ${todaysHigh} &deg${UNIT_SUFFIX.toUpperCase()}, Low: ${todaysLow} &deg${UNIT_SUFFIX.toUpperCase()}`;
    primaryInformationDiv.appendChild(highLowTemp);

    container.appendChild(primaryInformationDiv);

    const hourlyForecast = hourlyDisplay(data);
    container.appendChild(hourlyForecast);

    return container;
};

export default function Render() {
    const bgContainer = document.createElement("div");
    bgContainer.className = "relative h-lvh bg-[#1F322D] bg-cover";

    const loading = document.createElement("img");
    loading.className =
        "absolute top-[50%] -translate-y-1/2 left-[50%] -translate-x-1/2 w-[300px]";
    loading.src = loadingAnimation;

    getWeather().then((data) => {
        console.log(data);
        const backgroundImageUrl = getBackgroundImageUrl(data);
        console.log(backgroundImageUrl);
        bgContainer.className = "relative h-lvh";

        // url("https://ik.imagekit.io/bishwarup307/odin-weather/day/sunny-sm.jpeg?tr=w-401");
        bgContainer.style.background = `linear-gradient(to bottom, rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.1) 50%), url(${backgroundImageUrl}) no-repeat center center`;
        bgContainer.style.backgroundSize = "cover";
        loading.style.display = "none";

        const container = document.createElement("div");
        container.className = "container";
        container.appendChild(displayCurrentWeather(data));
        bgContainer.appendChild(container);

        const initHourlyForecastScroll = () => {
            const hourNow = dayjs().format("H");
            document.querySelector("#hourly-forecast").scrollLeft =
                80 * hourNow;
        };

        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                initHourlyForecastScroll
            );
        } else {
            initHourlyForecastScroll();
        }
    });

    bgContainer.appendChild(loading);

    return bgContainer;
}