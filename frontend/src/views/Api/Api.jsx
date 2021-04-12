import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function Api() {
  return (
    <div className="apidocs">
      <div className="api-notice"> Please note that we will be discontinuing the Berkeleytime API. Official support for the API will end on <b> Friday, April 30th at 11:59PM PST</b>. If you have concerns or would like assistance in removing your dependencies on the Berkeleytime API, please contact us at <a href="mailto:octo.berkeleytime@asuc.org">octo.berkeleytime@asuc.org</a> and we would be more than happy to assist you. </div>
      <SwaggerUI url="/assets/swagger.yaml" docExpansion="list" />
    </div>
  );
}

export default Api;
