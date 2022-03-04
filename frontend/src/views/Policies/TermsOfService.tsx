import React, { FC } from "react";

import Description from "../../components/Recruiting/Description";

const TermsOfService: FC = () => (
  <Description
    title={"Terms of Service"}
    bodyURL={"/assets/terms.md"}
    link={"/legal/privacy"}
    linkName={"Privacy Policy"}
  />
);

export default TermsOfService;
