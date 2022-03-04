import React, { ComponentProps } from "react";
import { Button } from "react-bootstrap";

import { ReactComponent as Trash } from "../../assets/svg/profile/trash.svg";

type Props = ComponentProps<typeof Button>;

const TrashButton = (props: Props) => (
  <Button className="profile-card-remove" variant="link" {...props}>
    <Trash />
  </Button>
);

export default TrashButton;
