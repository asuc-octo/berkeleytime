import React, { FC } from "react";

import Description from "../../components/Recruiting/Description";

const PrivacyPolicy: FC = () => (
  <Description
    title={"Privacy Policy"}
    bodyURL={"/assets/privacy.md"}
    link={"/legal/terms"}
    linkName={"Terms Of Service"}
  />
);

export default PrivacyPolicy;
