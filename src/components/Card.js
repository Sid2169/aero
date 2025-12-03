import iconPack from "./Icon";
import { airQualityLabel, calculateAqi, getUnitKey } from "./Util";

class Card {
    constructor() {
        this.iconClass = "w-6 h-6 fill-white mb-4 lg:w-12 lg:h-12";
        this.displayTextClass = "text-white text-md font-medium md:text-lg";
        this.attributeNameClass =
            "text-white font-light text-[10px] md:text-xs";
    }

    cardContainer() {
        const card = document.createElement("div");
        card.className =
            "flex flex-col px-4 py-4 rounded-xl  aspect-square justify-center items-center backdrop-brightness-75 backdrop-blur-md";

        const icon = document.createElement("div");
        icon.className = this.iconClass;
        icon.innerHTML = iconPack[this.iconKey];

        const text = document.createElement("p");
        text.className = this.displayTextClass;
        text.innerHTML = this.text;

        const attributeName = document.createElement("p");
        attributeName.className = this.attributeNameClass;
        attributeName.textContent = this.displayText;

        card.appendChild(icon);
        card.appendChild(text);
        card.appendChild(attributeName);
        return card;
    }
}

export class FeelsLikeCard extends Card {
    constructor({ current }, unit) {
        super();
        this.iconKey = "feelsLike";
        this.displayText = "Feels Like";
        this.text = `${Math.round(
            current[getUnitKey("feelslike", unit)]
        )} &deg${unit.toUpperCase()}`;
    }
}

export class HumidityCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "humidity";
        this.displayText = "Humidity";
        this.text = `${Math.round(current.humidity)} %`;
    }
}

export class WindSpeedCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "windSpeed";
        this.displayText = "Wind";
        this.text = `${Math.round(current.wind_kph)} KM/h`;
    }
}

export class VisibilityCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "visibility";
        this.displayText = "Visibility";
        this.text = `${Math.round(current.vis_km)} KM`;
    }
}

export class ChanceOfRainCard extends Card {
    constructor({ forecast }) {
        super();
        this.iconKey = "chanceOfRain";
        this.displayText = "Chance of Rain";
        this.text = `${forecast.forecastday[0].day.daily_chance_of_rain} %`;
    }
}

export class UVIndexCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "uvIndex";
        this.displayText = "UV Index";
        this.text = `${current.uv}`;
    }
}

export class SunriseCard extends Card {
    constructor({ forecast }) {
        super();
        this.iconClass = "";
        this.displayTextClass += " mt-4 text-base";
        this.iconKey = "sunrise";
        this.displayText = "Sunrise";
        this.text = forecast.forecastday[0].astro.sunrise;
    }
}

export class SunsetCard extends Card {
    constructor({ forecast }) {
        super();
        this.iconClass = "";
        this.displayTextClass += " mt-4 text-base";
        this.iconKey = "sunset";
        this.displayText = "Sunset";
        this.text = forecast.forecastday[0].astro.sunset;
    }
}

export class AirPressureCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "airPressure";
        this.displayText = "Pressure";
        this.text = `${current.pressure_in} inHg`;
    }
}

export class AQICard {
    constructor({ current }) {
        this.aqiIndex = current.air_quality["us-epa-index"];
        this.airQualityData = current.air_quality;
    }

    cardContainer() {
        const card = document.createElement("div");
        card.className =
            "flex flex-col px-8 py-8 rounded-xl backdrop-brightness-75 backdrop-blur-md mt-6 gap-1";

        const cardTitleDiv = document.createElement("div");
        cardTitleDiv.className = "flex items-center gap-2";

        const icon = document.createElement("div");
        icon.className = "w-3 h-3 fill-white lg:w-5 lg:h-5";
        icon.innerHTML = iconPack.aqi;
        cardTitleDiv.appendChild(icon);

        const title = document.createElement("p");
        title.textContent = "Air Quality";
        title.className = "text-white font-light lg:text-sm";
        cardTitleDiv.appendChild(title);

        const aqi = calculateAqi(this.airQualityData);
        const aqiText = document.createElement("h2");
        aqiText.textContent = aqi;
        aqiText.className = "mt-4 text-white text-lg lg:text-2xl";

        const aqiLabel = airQualityLabel(aqi);

        const airQuality = document.createElement("h3");
        airQuality.textContent = aqiLabel.label;
        airQuality.className = "text-white text-md lg:text-lg";

        const aqiBar = document.createElement("div");
        aqiBar.className =
            "relative mt-2 h-[4px] w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-300 via-orange-500 to-red-500";

        const pointer = document.createElement("div");
        pointer.className =
            "absolute h-[16px] w-[16px] bg-white rounded-full -translate-y-1/2 top-1/2 border-2 border-slate-800";
        const left = `${(100 * aqi) / 500}%`;
        pointer.style.left = left;
        aqiBar.appendChild(pointer);

        const aqiDescription = document.createElement("p");
        aqiDescription.className = "mt-2 text-slate-200 text-xs";
        aqiDescription.textContent = aqiLabel.description;

        // console.log(aqi);

        card.appendChild(cardTitleDiv);
        card.appendChild(aqiText);
        card.appendChild(airQuality);
        card.appendChild(aqiBar);
        card.appendChild(aqiDescription);

        return card;
    }
}