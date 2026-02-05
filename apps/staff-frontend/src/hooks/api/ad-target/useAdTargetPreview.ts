import { useEffect, useState } from "react";

import { useLazyQuery } from "@apollo/client";

import {
  AD_TARGET_PREVIEW,
  AdTargetPreviewClass,
} from "../../../lib/api/ad-target";

interface AdTargetPreviewResponse {
  adTargetPreview: AdTargetPreviewClass[];
}

export const useAdTargetPreview = () => {
  const [runPreviewQuery, result] =
    useLazyQuery<AdTargetPreviewResponse>(AD_TARGET_PREVIEW);
  const [preview, setPreview] = useState<AdTargetPreviewClass[]>([]);
  const [previewCalled, setPreviewCalled] = useState(false);

  useEffect(() => {
    if (result.data?.adTargetPreview) {
      setPreview(result.data.adTargetPreview);
    }
  }, [result.data]);

  const runPreview = (...args: Parameters<typeof runPreviewQuery>) => {
    setPreviewCalled(true);
    setPreview([]);
    return runPreviewQuery(...args);
  };

  const resetPreview = () => {
    setPreviewCalled(false);
    setPreview([]);
  };

  return {
    runPreview,
    resetPreview,
    preview,
    ...result,
    called: previewCalled,
  };
};
