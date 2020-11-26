import React, { FC } from 'react'
import Description from '../components/Recruiting/Description';

export const PrivacyPolicy: FC = () => (
  <Description
    title={"Privacy Policy"}
    bodyURL={"/assets/privacy.md"}
    link={'/legal/terms'}
    linkName={'Terms Of Service'}
  />
)

export const TermsOfService: FC = () => (
  <Description
    title={"Terms of Service"}
    bodyURL={"/assets/terms.md"}
    link={'/legal/privacy'}
    linkName={'Privacy Policy'}
  />
)
