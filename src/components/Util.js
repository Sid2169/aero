const BASE_URL = "https://ik.imagekit.io/bishwarup307/odin-weather/";

export default function getBackgroundImageUrl({ current }) {
    console.log(window.innerHeight);
    let url = BASE_URL;
    const timeOfDay = current.is_day ? "day" : "night";
    url += `${timeOfDay}/`;
    const suffix = window.innerHeight < 768 ? "sm" : "lg";
    const width = window.innerHeight < 768 ? 401 : 1080;
    url += `${current.condition.text.toLowerCase()}-${suffix}.jpeg?tr=w-${width}`;
    return url;
}