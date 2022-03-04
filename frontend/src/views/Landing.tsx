import Blurbs from "components/Landing/Blurbs";
import Explore from "components/Landing/Explore";
import Jumbotron from "components/Landing/Jumbotron";
import Mission from "components/Landing/Mission";
import React, { FC } from "react";

const Landing: FC = () => (
  <div>
    <Jumbotron />
    <Explore />
    <Mission />
    <Blurbs />
  </div>
);

export default Landing;
