import iconPack from "./Icon";
import { getUnitKey } from "./Util";

class Card {
    cardContainer() {
        const card = document.createElement("div");
        card.className =
            "flex flex-col px-4 py-4 rounded-xl  aspect-square justify-center items-center backdrop-brightness-75 backdrop-blur-md";

        const icon = document.createElement("div");
        icon.className = "w-6 h-6 fill-white";
        icon.innerHTML = iconPack[this.iconKey];

        const text = document.createElement("p");
        text.className = "text-white text-lg font-medium";
        text.innerHTML = this.text;

        const attributeName = document.createElement("p");
        attributeName.className = "text-white font-light text-xs";
        attributeName.textContent = this.scaleText;

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
        this.scaleText = "Feels Like";
        this.text = `${Math.round(
            current[getUnitKey("feelslike", unit)]
        )} &deg${unit.toUpperCase()}`;
    }
}

export class HumidityCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "humidity";
        this.scaleText = "Humidity";
        this.text = `${Math.round(current.humidity)} %`;
    }
}

export class WindSpeedCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "windSpeed";
        this.scaleText = "Wind";
        this.text = `${Math.round(current.wind_kph)} KM/h`;
    }
}

export class VisibilityCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "visibility";
        this.scaleText = "Visibility";
        this.text = `${Math.round(current.vis_km)} KM`;
    }
}

export class ChanceOfRainCard extends Card {
    constructor({ forecast }) {
        super();
        this.iconKey = "chanceOfRain";
        this.scaleText = "Chance of Rain";
        this.text = `${forecast.forecastday[0].day.daily_chance_of_rain} %`;
    }
}

export class UVIndexCard extends Card {
    constructor({ current }) {
        super();
        this.iconKey = "uvIndex";
        this.scaleText = "UV Index";
        this.text = `${current.uv}`;
    }
}