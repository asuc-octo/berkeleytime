import React, { Component } from 'react';
import Description from '../../components/Recruiting/Description';

export function DesignPosition(props) {
  return (
    <Description
        title={"Fall 2020 Product Designer Application"}
        bodyURL={"/assets/product-designer.md"}
        link={'/apply/design'}
    />
  );
}