import dayjs from "dayjs";
import loadingAnimation from "../assets/loading-2.gif";
import getWeather, { getAutoCompleteResults } from "./WeatherApi";
import iconPack from "./Icon";
import { getSummaryForecast, getUnitKey } from "./Util";
import getAssets from "./WeatherCode";
import {
    FeelsLikeCard,
    HumidityCard,
    WindSpeedCard,
    VisibilityCard,
    ChanceOfRainCard,
    UVIndexCard,
    SunriseCard,
    SunsetCard,
    AirPressureCard,
    AQICard,
} from "./Card";
import DailyForecast from "./DailyForecast";

let UNIT_SUFFIX = "c";
let activeUnit;

const hourlyForecastDisplay = function hourlyInformationDisplay({
    forecast,
    location,
}) {
    const hourlyForecastDiv = document.createElement("div");
    hourlyForecastDiv.id = "hourly-forecast";
    hourlyForecastDiv.className =
        "hourly-forecast-display flex gap-10 rounded-lg px-4 py-2 overflow-x-scroll backdrop-blur-sm backdrop-brightness-[.8]";

    const hourlyData = forecast.forecastday[0].hour;
    hourlyData.forEach((hour) => {
        const assets = getAssets(hour);

        const card = document.createElement("div");
        card.className = "flex flex-col gap-2";

        const time = document.createElement("p");
        time.className = "text-white text-xs whitespace-nowrap";
        time.textContent = dayjs(hour.time).format("h A");

        if (
            dayjs(hour.time).format("H") ===
            dayjs(location.localtime).format("H")
        )
            time.textContent = "Now";

        const icon = document.createElement("div");
        icon.className = "fill-slate-50 stroke-slate-50 h-10 w-10";
        icon.innerHTML = assets.icon;

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

const displayCurrentWeather = function displayCurrentWeatherInformation(data) {
    const todaysSummary = getSummaryForecast(data);

    const container = document.createElement("div");
    container.className = "grid grid-cols-1 px-2 pt-8 rounded-lg";

    // Div for locaiton, date and time scale
    const localeDiv = document.createElement("div");
    localeDiv.className = "flex gap-4 relative items-center";

    const searchLocationInput = document.createElement("input");
    searchLocationInput.className =
        "hidden absolute border-2 border-white rounded-full w-full h-12 bg-black bg-opacity-60 text-white text-sm px-4 focus:outline-none";
    localeDiv.appendChild(searchLocationInput);

    const autoCompleteDiv = document.createElement("div");
    autoCompleteDiv.className = "absolute w-full top-12 rounded-full z-50";
    localeDiv.appendChild(autoCompleteDiv);

    const locationDiv = document.createElement("div");
    locationDiv.className = "flex items-start gap-2";
    const locIcon = document.createElement("div");
    locIcon.className = "w-4 h-4 fill-slate-100";
    locIcon.innerHTML = iconPack.location;
    locationDiv.appendChild(locIcon);
    const locationText = document.createElement("p");
    locationText.innerHTML = `${data.location.name}<span class="hidden lg:inline-block">, ${data.location.country}</span>`;
    locationText.className = "text-slate-100 text-sm";
    locationDiv.appendChild(locationText);
    localeDiv.appendChild(locationDiv);

    const searchDiv = document.createElement("div");
    searchDiv.className = "fill-slate-50 mr-auto";
    const searchButton = document.createElement("button");
    searchButton.className = "w-4 h-4 fill-slate-50";
    searchButton.innerHTML = iconPack.searchLocation;
    searchDiv.appendChild(searchButton);
    localeDiv.appendChild(searchDiv);

    const toggleTempUnitDiv = document.createElement("div");
    toggleTempUnitDiv.className = "flex items-center flex-1";
    const cButton = document.createElement("button");
    cButton.className = "toggle-temp rounded-l-full py-1 px-2 flex-1 text-sm";
    cButton.innerHTML = "&degC";
    toggleTempUnitDiv.appendChild(cButton);
    const fButton = document.createElement("button");
    fButton.className = "toggle-temp rounded-r-full py-1 px-2 flex-1 text-sm";
    fButton.innerHTML = "&degF";
    toggleTempUnitDiv.appendChild(fButton);
    localeDiv.appendChild(toggleTempUnitDiv);

    if (UNIT_SUFFIX === "c") cButton.classList.add("active");
    else if (UNIT_SUFFIX === "f") fButton.classList.add("active");

    cButton.addEventListener("click", () => {
        if (cButton.classList.contains("active")) return;
        fButton.classList.remove("active");
        cButton.classList.add("active");
        UNIT_SUFFIX = "c";
        const root = document.querySelector("#root");
        root.innerHTML = "";
        root.appendChild(Render(root.dataset.currentLocation));
    });
    fButton.addEventListener("click", () => {
        if (fButton.classList.contains("active")) return;
        cButton.classList.remove("active");
        fButton.classList.add("active");
        UNIT_SUFFIX = "f";
        const root = document.querySelector("#root");
        root.innerHTML = "";
        root.appendChild(Render(root.dataset.currentLocation));
    });

    const dateTimeDiv = document.createElement("div");
    dateTimeDiv.className = "flex flex-col";

    const dateDiv = document.createElement("div");
    dateDiv.className = "flex text-white text-xs ps-6";
    const dayOfWeek = dayjs().format("dddd");
    const date = dayjs(data.location.localtime).format("D MMM, YYYY"); // dayjs().format("D MMM, YYYY");
    dateDiv.innerHTML = `<span class="hidden lg:inline-block">${dayOfWeek} | </span> ${date}`;
    dateTimeDiv.appendChild(dateDiv);

    const timeDiv = document.createElement("div");
    timeDiv.textContent = dayjs(data.location.localtime).format("h:mm a"); // dayjs().format("h:mm a");
    timeDiv.className = "text-white text-xs ps-6";
    dateTimeDiv.appendChild(timeDiv);
    localeDiv.appendChild(dateTimeDiv);
    container.appendChild(localeDiv);

    searchButton.addEventListener("click", () => {
        searchLocationInput.style.display = "block";
        searchLocationInput.focus();
        searchButton.style.scale = "0";
        locationDiv.style.scale = "0";
        dateTimeDiv.style.scale = "0";
        toggleTempUnitDiv.style.scale = "0";
    });

    searchLocationInput.addEventListener("input", () => {
        if (!searchLocationInput.value) {
            autoCompleteDiv.innerHTML = "";
            return;
        }

        getAutoCompleteResults(searchLocationInput.value).then((results) => {
            autoCompleteDiv.innerHTML = "";

            const placeContainer = document.createElement("div");
            placeContainer.className = "flex flex-col px-1";

            results.forEach((place) => {
                const placeBtn = document.createElement("button");
                placeBtn.className =
                    "flex flex-col gap-2 px-3 py-4 backdrop-blur-md backdrop-brightness-[.65] border-[1px] border-slate-700 rounded-md";
                placeBtn.dataset.searchCity = place.name;

                const city = document.createElement("p");
                city.className = "text-white text-sm font-medium";
                city.textContent = place.name;
                placeBtn.appendChild(city);

                const stateCountry = document.createElement("p");
                stateCountry.className = "text-slate-300 text-xs";
                stateCountry.textContent = `${place.region}, ${place.country}`;
                placeBtn.appendChild(stateCountry);
                placeContainer.appendChild(placeBtn);

                placeBtn.addEventListener("click", () => {
                    // console.log("location changed");
                    const root = document.querySelector("#root");
                    root.innerHTML = "";
                    root.appendChild(Render(searchLocationInput.value));
                });
            });

            autoCompleteDiv.appendChild(placeContainer);
        });
    });

    // Div containing primary weather information
    const primaryInformationDiv = document.createElement("div");
    primaryInformationDiv.className =
        "flex flex-col gap-1 justify-center items-center py-12";

    const currentDiv = document.createElement("div");
    currentDiv.className = "flex gap-6 justify-center items-center";

    const assets = getAssets(data.current);
    const iconDiv = document.createElement("div");
    const weatherIcon = assets.icon;
    iconDiv.innerHTML = weatherIcon;
    iconDiv.className = "w-20 h-20 fill-white lg:w-28 lg:h-28";
    currentDiv.appendChild(iconDiv);

    const textDiv = document.createElement("div");
    textDiv.className = "flex flex-col";

    const currentTemp = document.createElement("p");
    currentTemp.className = "text-white font-medium text-6xl";
    currentTemp.textContent = Math.round(
        data.current[getUnitKey("temp", UNIT_SUFFIX)]
    );
    const tempUnitSpan = document.createElement("span");
    tempUnitSpan.innerHTML = `  &deg${UNIT_SUFFIX.toUpperCase()}`;
    tempUnitSpan.className = "text-white font-medium text-2xl";
    currentTemp.appendChild(tempUnitSpan);
    textDiv.appendChild(currentTemp);

    const weatherText = document.createElement("p");
    weatherText.textContent = assets.text;
    weatherText.className = "text-white font-light text-lg lg:text-2xl";
    textDiv.appendChild(weatherText);
    currentDiv.appendChild(textDiv);
    primaryInformationDiv.appendChild(currentDiv);

    const highLowTemp = document.createElement("p");
    highLowTemp.className = "text-white mt-8";
    const todaysHigh = Math.round(
        todaysSummary[getUnitKey("maxtemp", UNIT_SUFFIX)]
    );
    const todaysLow = Math.round(
        todaysSummary[getUnitKey("mintemp", UNIT_SUFFIX)]
    );
    highLowTemp.innerHTML = `High: ${todaysHigh} &deg${UNIT_SUFFIX.toUpperCase()}, Low: ${todaysLow} &deg${UNIT_SUFFIX.toUpperCase()}`;
    primaryInformationDiv.appendChild(highLowTemp);

    container.appendChild(primaryInformationDiv);

    const hourlyForecast = hourlyForecastDisplay(data);
    container.appendChild(hourlyForecast);

    return container;
};

export default function Render(location) {
    const bgContainer = document.createElement("div");
    bgContainer.className = "relative h-lvh bg-[#093140] bg-cover";

    const loading = document.createElement("img");
    loading.className =
        "absolute top-[50%] -translate-y-1/2 left-[50%] -translate-x-1/2 w-[300px] lg:w-[500px]";
    loading.src = loadingAnimation;

    getWeather(location).then((data) => {
        console.log(data);
        const assets = getAssets(data.current);
        const backgroundImageUrl = assets.bgUrl;
        console.log(backgroundImageUrl);
        bgContainer.className = "relative";

        // url("https://ik.imagekit.io/bishwarup307/odin-weather/day/sunny-sm.jpeg?tr=w-401");
        bgContainer.style.background = `linear-gradient(to bottom, rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.1) 50%), url(${backgroundImageUrl}) no-repeat fixed center`;
        bgContainer.style.backgroundSize = "cover";
        loading.style.scale = "0";

        const container = document.createElement("div");
        container.className =
            "container pb-12 w-full max-w-md md:max-w-lg lg:max-w-2xl";
        container.appendChild(displayCurrentWeather(data));

        const cards = document.createElement("div");
        cards.className =
            "grid grid-cols-3 gap-x-4 gap-y-4 mt-16 mx-2 lg:gap-x-10";

        const feelsLike = new FeelsLikeCard(data, UNIT_SUFFIX);
        cards.appendChild(feelsLike.display());

        const humidity = new HumidityCard(data);
        cards.appendChild(humidity.display());

        const windSpeed = new WindSpeedCard(data);
        cards.appendChild(windSpeed.display());

        const visibility = new VisibilityCard(data);
        cards.appendChild(visibility.display());

        const chanceOfRain = new ChanceOfRainCard(data);
        cards.appendChild(chanceOfRain.display());

        const uvIndex = new UVIndexCard(data);
        cards.appendChild(uvIndex.display());

        const sunrise = new SunriseCard(data);
        cards.appendChild(sunrise.display());

        const sunset = new SunsetCard(data);
        cards.appendChild(sunset.display());

        const pressure = new AirPressureCard(data);
        cards.appendChild(pressure.display());

        container.appendChild(cards);

        const aqi = new AQICard(data);
        container.appendChild(aqi.cardContainer());

        container.appendChild(DailyForecast(data, UNIT_SUFFIX));

        bgContainer.appendChild(container);

        const initHourlyForecastScroll = () => {
            // const hourNow = dayjs().format("H");
            const hourNow = dayjs(data.location.localtime).format("H");
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

        document.querySelector(
            "#root"
        ).dataset.currentLocation = `${data.location.lat},${data.location.lon}`;
    });

    bgContainer.appendChild(loading);

    return bgContainer;
}