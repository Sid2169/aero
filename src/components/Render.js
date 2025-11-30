import dayjs from "dayjs";
import loadingAnimation from "../assets/loading.gif";
import getWeather from "./WeatherApi";
import iconPack from "./Icon";

const getIcon = ({ current }) => {
    let iconKey = current.condition.text.toLowerCase().replaceAll(" ", "-");
    iconKey = current.is_day ? (iconKey += "-d") : (iconKey += "-n");
    return iconPack[iconKey];
};

const displayCurrentWeather = function displayCurrentWeaterInformation(data) {
    const container = document.createElement("div");
    container.className =
        "grid grid-cols-2 backdrop-brightness-[.85] px-2 py-2 rounded-lg";

    const primaryInformationDiv = document.createElement("div");
    primaryInformationDiv.className =
        "flex flex-col gap-1 justify-start items-start";

    const locationDiv = document.createElement("div");
    locationDiv.className = "flex items-center gap-2";
    const locIcon = document.createElement("div");
    locIcon.className = "w-4 h-4 fill-slate-100";
    locIcon.innerHTML = iconPack.location;
    locationDiv.appendChild(locIcon);
    const locationText = document.createElement("p");
    locationText.textContent = `${data.location.name}, ${data.location.country}`;
    locationText.className = "text-slate-100 text-sm";
    locationDiv.appendChild(locationText);
    primaryInformationDiv.appendChild(locationDiv);

    const dateDiv = document.createElement("div");
    dateDiv.className = "flex text-white text-xs ps-6";
    const dayOfWeek = dayjs().format("dddd");
    const date = dayjs().format("D MMM, YYYY");
    dateDiv.textContent = `${dayOfWeek} | ${date}`;
    primaryInformationDiv.appendChild(dateDiv);

    const timeDiv = document.createElement("div");
    timeDiv.textContent = dayjs().format("h:m a");
    timeDiv.className = "text-white text-xs ps-6";
    primaryInformationDiv.appendChild(timeDiv);

    const iconDiv = document.createElement("div");
    const weatherIcon = getIcon(data);
    iconDiv.innerHTML = weatherIcon;
    iconDiv.className = "w-32 h-32 fill-white mt-12";
    primaryInformationDiv.appendChild(iconDiv);

    const currentTemp = document.createElement("p");
    currentTemp.className = "text-white font-medium text-6xl ps-4";
    currentTemp.textContent = Math.round(data.current.temp_c);
    const tempUnitSpan = document.createElement("span");
    tempUnitSpan.innerHTML = "  &degC";
    tempUnitSpan.className = "text-white font-medium text-2xl";
    currentTemp.appendChild(tempUnitSpan);

    primaryInformationDiv.appendChild(currentTemp);

    const weatherText = document.createElement("p");
    weatherText.textContent = data.current.condition.text;
    weatherText.className = "text-white font-medium text-2xl ps-4";
    primaryInformationDiv.appendChild(weatherText);

    container.appendChild(primaryInformationDiv);
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
        bgContainer.className = "relative h-lvh";

        bgContainer.style.background =
            "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.1) 100%), url('https://ik.imagekit.io/bishwarup307/odin-weather/day/sunny-sm.jpeg?tr=w-401') no-repeat center center";
        bgContainer.style.backgroundSize = "cover";
        loading.style.display = "none";

        const container = document.createElement("div");
        container.className = "container";
        container.appendChild(displayCurrentWeather(data));
        bgContainer.appendChild(container);
    });

    bgContainer.appendChild(loading);
    return bgContainer;
}