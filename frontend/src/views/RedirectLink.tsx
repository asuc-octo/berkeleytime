import React, { FC } from "react";
import { useHistory, useLocation } from "react-router-dom";

// We must have an allowlist of redirects to prevent an attacker from arbitrarily opening external sites.
const allowedRedirects = new Map([
  ["workshop-facebook", "https://www.facebook.com/events/314954970047731"],
  [
    "workshop-register",
    "https://docs.google.com/forms/d/e/1FAIpQLSf92FiqIwMc5et1ZSI_Rj1NGi3Y7Rx2kyMl8uQLSX1QzDIsuQ/viewform?usp=sf_link",
  ],
]);

const RedirectLink: FC = () => {
  const params = new URLSearchParams(useLocation().search);
  const site = params.get("site");
  if (site != null && allowedRedirects.has(site)) {
    window.open(allowedRedirects.get(site), "_blank");
  }
  const history = useHistory();
  history.goBack();
  return null;
};

export default RedirectLink;
