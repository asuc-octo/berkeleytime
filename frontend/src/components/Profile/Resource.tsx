import React from "react";
import { Link as RoutingLink } from "react-router-dom";

type Props = {
  text: string;
  link?: string;
  isDestructive?: boolean;
  onClick?: () => void;
};

const Resource = ({ text, link, isDestructive = false, onClick }: Props) => {
  const isExternal = link?.includes(":");
  const Component = (!link || isExternal ? "a" : RoutingLink) as any;
  const props = !link
    ? {}
    : isExternal
    ? {
        href: link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {
        to: link,
      };

  return (
    <div className="profile-row">
      <Component {...props} onClick={onClick}>
        <p className={`resource-text-${isDestructive ? "red" : "blue"}`}>
          {text}
        </p>
      </Component>
    </div>
  );
};

export default Resource;
