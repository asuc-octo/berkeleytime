import React from 'react';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css"

function Api() {

    return (
        <div className="apidocs">
            <SwaggerUI url="/swagger.yaml" docExpansion="list" />
        </div>
    )
}

export default Api;
