import React, { Component } from 'react';
import Description from '../../components/Recruiting/Description';

export function Positions(props) {
  return (
    <Description
        title={"OCTO's 2020-21 Positions"}
        bodyURL={"/assets/positions.md"}
        link={'/apply'}
        linkName={'Go to Application'}
    />
  );
}
