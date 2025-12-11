import dayjs from "dayjs";
import iconPack from "./Icon";
import getAssets from "./WeatherCode";
import { getUnitKey } from "./Util";

const dailyForecastCard = (day, unit, isDay, index) => {
    const record = day.day;
    record.is_day = isDay;

    const { icon, text } = getAssets(record);
    const today = index === 0 ? "Today" : null;

    const container = document.createElement("div");
    container.className = "grid grid-cols-4 items-center lg:grid-cols-5";

    const dayOfWeek = dayjs(day.date).format("ddd");
    const dayMarker = document.createElement("h3");
    dayMarker.textContent = today || dayOfWeek.toUpperCase();
    dayMarker.className = "font-medium text-sm text-white lg:text-md";

    const weatherSummary = document.createElement("div");
    weatherSummary.className = "flex gap-2 items-center lg:col-span-2";
    const weatherIcon = document.createElement("div");
    weatherIcon.className = "fill-white w-8 h-8";
    weatherIcon.innerHTML = icon;
    weatherSummary.appendChild(weatherIcon);
    const weatherText = document.createElement("p");
    weatherText.className = "hidden text-white text-xs lg:inline-block";
    weatherText.textContent = text;
    weatherSummary.appendChild(weatherText);

    const low = Math.round(day.day[getUnitKey("mintemp", unit)]);
    const high = Math.round(day.day[getUnitKey("maxtemp", unit)]);

    // const lowDiv = document.createElement('div');
    // lowDiv.className = "flex gap-2"
    const dayLow = document.createElement("p");
    dayLow.className = "text-white text-sm";
    dayLow.innerHTML = `Low: ${low}&deg`;

    const dayHigh = document.createElement("p");
    dayHigh.className = "text-white text-sm";
    dayHigh.innerHTML = `High: ${high}&deg`;

    container.appendChild(dayMarker);
    container.appendChild(weatherSummary);
    container.appendChild(dayLow);
    container.appendChild(dayHigh);

    return container;
};

export default function DailyForecast({ current, forecast }, unit) {
    const isDay = current.is_day;

    const container = document.createElement("div");
    container.className =
        "mx-2 flex flex-col px-8 py-8 rounded-xl backdrop-brightness-75 backdrop-blur-md mt-6";

    const header = document.createElement("div");
    header.className =
        "flex gap-3 pb-2 items-center border-b-[1px] border-b-slate-600 mb-4";
    const icon = document.createElement("div");
    icon.className = "fill-slate-400 w-3 h-3 lg:w-5 lg:h-5";
    icon.innerHTML = iconPack.calendar;
    header.appendChild(icon);
    const headerText = document.createElement("p");
    headerText.className = "text-slate-200 text-sm";
    headerText.textContent = "7-Day Forecast";
    header.appendChild(headerText);

    container.appendChild(header);

    const forecastDiv = document.createElement("div");
    forecastDiv.className = "flex flex-col gap-4";

    forecast.forecastday.forEach((day, index) => {
        forecastDiv.appendChild(dailyForecastCard(day, unit, isDay, index));
    });
    container.appendChild(forecastDiv);

    return container;
}