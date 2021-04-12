import React, { FC } from 'react'
import { useHistory, useLocation } from 'react-router-dom';

// We must have an allowlist of redirects to prevent an attacker from arbitrarily opening external sites.
const allowedRedirects = new Map([
	["civhacks", "https://www.civhacks.com"],
	["civhacks-register", "https://pzudnhexo5v.typeform.com/to/demEictZ"]
])

const RedirectLink: FC = () => {
  const params = new URLSearchParams(useLocation().search);
  const site = params.get("site");
  if (site != null && allowedRedirects.has(site)) {
  	window.open(allowedRedirects.get(site), '_blank');
  }
  const history = useHistory();
  history.goBack();
  return null;
}

export default RedirectLink

