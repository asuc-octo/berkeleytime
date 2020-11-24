export function formatLocation(location: string) {
    if (location === "Internet/Online") {
        return "Online";
    } else {
        return location;
    }
}