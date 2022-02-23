import moment from "moment-timezone";

export default () =>
  moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH-mm-ss`);
