import React, { FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Button } from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";

import { ReduxState } from "../../redux/store";
import { closeBanner } from "../../redux/common/actions";

import close from "../../assets/svg/common/close.svg";

interface Props extends PropsFromRedux {}

const Banner: FC<Props> = (props) => {
  const location = useLocation();
  const history = useHistory();
  const text = <p>Spring 2022 recruitment is open!</p>;
  const links = (
    <p>
      <a href="https://github.com/asuc-octo/berkeleytime">GitHub</a>,{" "}
      <a href="https://discord.gg/DeCEPNdPjc">Discord</a>
    </p>
  );

  function redirect(site: string) {
    history.push("/redirect?site=" + site);
  }

  return props.banner ? (
    <div className="banner">
      <div className="content">
        {text}
        <Button size="sm" href="https://form.typeform.com/to/yVbpSDBN">
          Apply Now
        </Button>
        {links}
      </div>
      <img src={close} alt="close" onClick={props.closeBanner} />
    </div>
  ) : null;
};

const mapState = (state: ReduxState) => ({
  banner: state.common.banner,
});

const mapDispatch = {
  closeBanner,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Banner);
