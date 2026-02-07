import { useCallback, useEffect, useState } from "react";

type ApiType = "classes" | "courses" | "terms";

// Credentials injected from environment at build time
const ENV_CREDENTIALS: Record<ApiType, { appId: string; appKey: string }> = {
  classes: {
    appId: __SIS_CLASS_APP_ID__,
    appKey: __SIS_CLASS_APP_KEY__,
  },
  courses: {
    appId: __SIS_COURSE_APP_ID__,
    appKey: __SIS_COURSE_APP_KEY__,
  },
  terms: {
    appId: __SIS_TERM_APP_ID__,
    appKey: __SIS_TERM_APP_KEY__,
  },
};

interface EndpointConfig {
  name: string;
  path: string;
  description: string;
  params: ParamConfig[];
  pathParams?: string[];
}

interface ParamConfig {
  name: string;
  label: string;
  type: "text" | "select" | "number" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
}

const ENDPOINTS: Record<ApiType, EndpointConfig[]> = {
  classes: [
    {
      name: "getClasses",
      path: "/v1/classes",
      description: "Get class data (requires term-id or cs-course-id)",
      params: [
        { name: "term-id", label: "Term ID", type: "text" },
        { name: "cs-course-id", label: "CS Course ID", type: "text" },
        { name: "subject-area-code", label: "Subject Area Code", type: "text" },
        { name: "catalog-number", label: "Catalog Number", type: "text" },
        { name: "session-id", label: "Session ID", type: "text" },
        { name: "class-number", label: "Class Number", type: "text" },
        {
          name: "status-code",
          label: "Status Code",
          type: "select",
          options: [
            { value: "", label: "Any" },
            { value: "A", label: "Active" },
            { value: "S", label: "Stop Further Enrollment" },
            { value: "X", label: "Cancelled" },
          ],
        },
        {
          name: "instruction-mode-code",
          label: "Instruction Mode",
          type: "select",
          options: [
            { value: "", label: "Any" },
            { value: "P", label: "In Person" },
            { value: "EF", label: "Flexible" },
            { value: "W", label: "Web-based" },
            { value: "O", label: "Online" },
            { value: "H", label: "Hybrid" },
          ],
        },
        { name: "page-number", label: "Page Number", type: "number" },
        { name: "page-size", label: "Page Size (max 100)", type: "number" },
      ],
    },
    {
      name: "getClassSections",
      path: "/v1/classes/sections",
      description: "Get class section data (requires term-id or cs-course-id)",
      params: [
        { name: "term-id", label: "Term ID", type: "text" },
        { name: "cs-course-id", label: "CS Course ID", type: "text" },
        { name: "subject-area-code", label: "Subject Area Code", type: "text" },
        { name: "catalog-number", label: "Catalog Number", type: "text" },
        { name: "session-id", label: "Session ID", type: "text" },
        { name: "class-number", label: "Class Number", type: "text" },
        { name: "section-number", label: "Section Number", type: "text" },
        { name: "component-code", label: "Component Code", type: "text" },
        {
          name: "instructor-family-name",
          label: "Instructor Last Name",
          type: "text",
        },
        { name: "meets-days", label: "Meets Days (e.g. MoWeFr)", type: "text" },
        { name: "start-time", label: "Start Time (HH:MM)", type: "text" },
        { name: "end-time", label: "End Time (HH:MM)", type: "text" },
        { name: "page-number", label: "Page Number", type: "number" },
        { name: "page-size", label: "Page Size (max 100)", type: "number" },
      ],
    },
    {
      name: "getClassDescriptors",
      path: "/v1/classes/descriptors",
      description: "Get allowable code/descriptor pairs",
      params: [{ name: "field-name", label: "Field Name", type: "text" }],
    },
    {
      name: "getClassSectionDescriptors",
      path: "/v1/classes/sections/descriptors",
      description: "Get class section descriptor pairs",
      params: [{ name: "field-name", label: "Field Name", type: "text" }],
    },
  ],
  courses: [
    {
      name: "getCourses",
      path: "/v5/courses",
      description: "Get course data",
      params: [
        { name: "subject-area-code", label: "Subject Area Code", type: "text" },
        { name: "catalog-number", label: "Catalog Number", type: "text" },
        {
          name: "status-code",
          label: "Status Code",
          type: "select",
          options: [
            { value: "", label: "Any" },
            { value: "ACTIVE", label: "Active" },
            { value: "FUTURE", label: "Future" },
            { value: "HISTORICAL", label: "Historical" },
            { value: "INACTIVE", label: "Inactive" },
          ],
        },
        {
          name: "academic-career-code",
          label: "Academic Career Code",
          type: "text",
        },
        {
          name: "last-updated-since",
          label: "Last Updated Since (YYYY-MM-DD)",
          type: "date",
        },
        {
          name: "sort-by",
          label: "Sort By",
          type: "select",
          options: [
            { value: "", label: "Default (last-updated)" },
            { value: "subject-area-code", label: "Subject Area Code" },
            { value: "catalog-number", label: "Catalog Number" },
            { value: "last-updated", label: "Last Updated" },
          ],
        },
        { name: "page-number", label: "Page Number", type: "number" },
        { name: "page-size", label: "Page Size (max 100)", type: "number" },
      ],
    },
    {
      name: "getCourseById",
      path: "/v5/courses/{id}",
      description: "Get course data by ID",
      pathParams: ["id"],
      params: [
        {
          name: "id",
          label: "Course ID / Display Name",
          type: "text",
          required: true,
        },
        {
          name: "status-code",
          label: "Status Code",
          type: "select",
          options: [
            { value: "", label: "Any" },
            { value: "ACTIVE", label: "Active" },
            { value: "FUTURE", label: "Future" },
            { value: "HISTORICAL", label: "Historical" },
            { value: "INACTIVE", label: "Inactive" },
          ],
        },
      ],
    },
    {
      name: "getCoursesV4",
      path: "/v4/courses",
      description: "Get course data (v4 API)",
      params: [
        { name: "subject-area-code", label: "Subject Area Code", type: "text" },
        { name: "catalog-number", label: "Catalog Number", type: "text" },
        { name: "course-prefix", label: "Course Prefix", type: "text" },
        { name: "course-number", label: "Course Number", type: "text" },
        { name: "status-code", label: "Status Code", type: "text" },
        {
          name: "academic-career-code",
          label: "Academic Career Code",
          type: "text",
        },
        { name: "units", label: "Units", type: "text" },
        {
          name: "grading-basis-code",
          label: "Grading Basis Code",
          type: "text",
        },
        {
          name: "requirement-fulfilled-code",
          label: "Requirement Fulfilled Code",
          type: "text",
        },
        {
          name: "last-updated-since",
          label: "Last Updated Since (YYYY-MM-DD)",
          type: "date",
        },
        { name: "page-number", label: "Page Number", type: "number" },
        { name: "page-size", label: "Page Size (max 100)", type: "number" },
      ],
    },
  ],
  terms: [
    {
      name: "getTerms",
      path: "/v2/terms",
      description: "Get term data by query parameters",
      params: [
        { name: "career-code", label: "Career Code", type: "text" },
        {
          name: "temporal-position",
          label: "Temporal Position",
          type: "select",
          options: [
            { value: "", label: "Default (Current)" },
            { value: "Previous", label: "Previous" },
            { value: "Current", label: "Current" },
            { value: "Next", label: "Next" },
          ],
        },
        { name: "as-of-date", label: "As Of Date (YYYY-MM-DD)", type: "date" },
      ],
    },
    {
      name: "getTermById",
      path: "/v2/terms/{term-id}",
      description: "Get term data by ID",
      pathParams: ["term-id"],
      params: [
        { name: "term-id", label: "Term ID", type: "text", required: true },
        { name: "career-code", label: "Career Code", type: "text" },
      ],
    },
  ],
};

const BASE_URL = "https://gateway.api.berkeley.edu/sis";

function App() {
  const [apiType, setApiType] = useState<ApiType>("classes");
  const [appId, setAppId] = useState(ENV_CREDENTIALS.classes.appId);
  const [appKey, setAppKey] = useState(ENV_CREDENTIALS.classes.appKey);
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [useEnvCredentials, setUseEnvCredentials] = useState(true);

  const currentEndpoint = ENDPOINTS[apiType][endpointIndex];

  // Update credentials when API type changes (if using env credentials)
  useEffect(() => {
    if (useEnvCredentials) {
      console.log("Using env credentials for", apiType, ENV_CREDENTIALS);
      setAppId(ENV_CREDENTIALS[apiType].appId);
      setAppKey(ENV_CREDENTIALS[apiType].appKey);
    }
  }, [apiType, useEnvCredentials]);

  const handleApiTypeChange = (newType: ApiType) => {
    setApiType(newType);
    setEndpointIndex(0);
    setParams({});
    setResponse(null);
    setError(null);
    setCurrentPage(1);
  };

  const handleEndpointChange = (index: number) => {
    setEndpointIndex(index);
    setParams({});
    setResponse(null);
    setError(null);
    setCurrentPage(1);
  };

  const handleParamChange = (name: string, value: string) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const buildUrl = useCallback(
    (pageOverride?: number) => {
      let path = currentEndpoint.path;
      const queryParams = new URLSearchParams();
      const page = pageOverride ?? currentPage;

      for (const [key, value] of Object.entries(params)) {
        if (!value) continue;

        if (currentEndpoint.pathParams?.includes(key)) {
          path = path.replace(`{${key}}`, encodeURIComponent(value));
        } else {
          queryParams.set(key, value);
        }
      }

      // Add page number if not already set and endpoint supports pagination
      const supportsPagination = currentEndpoint.params.some(
        (p) => p.name === "page-number"
      );
      if (supportsPagination && !params["page-number"]) {
        queryParams.set("page-number", page.toString());
      }

      const queryString = queryParams.toString();
      return `${BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
    },
    [currentEndpoint, params, currentPage]
  );

  const fetchData = useCallback(
    async (pageOverride?: number) => {
      if (!appId || !appKey) {
        setError("Please enter your API credentials (app_id and app_key)");
        return;
      }

      // Validate required path params
      if (currentEndpoint.pathParams) {
        for (const pathParam of currentEndpoint.pathParams) {
          if (!params[pathParam]) {
            setError(`${pathParam} is required for this endpoint`);
            return;
          }
        }
      }

      setLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        const url = buildUrl(pageOverride);
        const res = await fetch(url, {
          headers: {
            app_id: appId,
            app_key: appKey,
          },
        });

        const endTime = performance.now();
        setResponseTime(Math.round(endTime - startTime));

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.apiResponse?.message?.description || `HTTP ${res.status}`
          );
        }

        setResponse(data);
        if (pageOverride) {
          setCurrentPage(pageOverride);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setResponse(null);
      } finally {
        setLoading(false);
      }
    },
    [appId, appKey, buildUrl, currentEndpoint, params]
  );

  const handleSubmit = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  const handleNextPage = () => {
    fetchData(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchData(currentPage - 1);
    }
  };

  const getResultCount = () => {
    if (!response) return null;
    const resp = response as {
      apiResponse?: { response?: Record<string, unknown[]> };
    };
    const data = resp.apiResponse?.response;
    if (!data) return null;

    const keys = [
      "classes",
      "classSections",
      "courses",
      "terms",
      "fieldValueLists",
    ];
    for (const key of keys) {
      if (data[key] && Array.isArray(data[key])) {
        return data[key].length;
      }
    }
    return null;
  };

  const supportsPagination = currentEndpoint.params.some(
    (p) => p.name === "page-number"
  );
  const resultCount = getResultCount();

  return (
    <div className="container">
      <h1>SIS API Sandbox</h1>

      <div className="credentials">
        <h2>API Credentials</h2>
        <div className="credentials-row">
          <div className="input-group">
            <label htmlFor="app-id">App ID</label>
            <input
              id="app-id"
              type="text"
              value={appId}
              onChange={(e) => {
                setAppId(e.target.value);
                setUseEnvCredentials(false);
              }}
              placeholder="Enter your app_id"
            />
          </div>
          <div className="input-group">
            <label htmlFor="app-key">App Key</label>
            <input
              id="app-key"
              type="password"
              value={appKey}
              onChange={(e) => {
                setAppKey(e.target.value);
                setUseEnvCredentials(false);
              }}
              placeholder="Enter your app_key"
            />
          </div>
        </div>
        {ENV_CREDENTIALS[apiType].appId && (
          <div className="env-notice">
            Credentials loaded from .env file for {apiType} API.
            {!useEnvCredentials && (
              <button
                className="btn-link"
                onClick={() => {
                  setUseEnvCredentials(true);
                  setAppId(ENV_CREDENTIALS[apiType].appId);
                  setAppKey(ENV_CREDENTIALS[apiType].appKey);
                }}
              >
                Reset to .env
              </button>
            )}
          </div>
        )}
      </div>

      <div className="main-content">
        <div className="sidebar">
          <h2>API Selection</h2>
          <div className="input-group">
            <label htmlFor="api-type">API Type</label>
            <select
              id="api-type"
              value={apiType}
              onChange={(e) => handleApiTypeChange(e.target.value as ApiType)}
            >
              <option value="classes">Classes API</option>
              <option value="courses">Courses API</option>
              <option value="terms">Terms API</option>
            </select>
          </div>

          <div className="input-group" style={{ marginTop: 12 }}>
            <label htmlFor="endpoint">Endpoint</label>
            <select
              id="endpoint"
              value={endpointIndex}
              onChange={(e) => handleEndpointChange(Number(e.target.value))}
            >
              {ENDPOINTS[apiType].map((endpoint, i) => (
                <option key={endpoint.name} value={i}>
                  {endpoint.name}
                </option>
              ))}
            </select>
          </div>

          <div className="endpoint-info">
            <strong>{currentEndpoint.path}</strong>
            <br />
            <small>{currentEndpoint.description}</small>
          </div>

          <div className="params-section">
            <h2>Parameters</h2>
            <div className="params-grid">
              {currentEndpoint.params.map((param) => (
                <div key={param.name} className="input-group">
                  <label htmlFor={param.name}>
                    {param.label}
                    {param.required && <span style={{ color: "red" }}> *</span>}
                  </label>
                  {param.type === "select" ? (
                    <select
                      id={param.name}
                      value={params[param.name] || ""}
                      onChange={(e) =>
                        handleParamChange(param.name, e.target.value)
                      }
                    >
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={param.name}
                      type={
                        param.type === "number"
                          ? "number"
                          : param.type === "date"
                            ? "date"
                            : "text"
                      }
                      value={params[param.name] || ""}
                      onChange={(e) =>
                        handleParamChange(param.name, e.target.value)
                      }
                      placeholder={
                        param.type === "date" ? "YYYY-MM-DD" : undefined
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="btn-row">
            <button className="btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Loading..." : "Send Request"}
            </button>
          </div>
        </div>

        <div className="results">
          <div className="results-header">
            <h2>Response</h2>
            {supportsPagination && response !== null && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={handlePrevPage}
                  disabled={loading || currentPage <= 1}
                >
                  Previous
                </button>
                <span>Page {currentPage}</span>
                <button
                  className="btn btn-secondary"
                  onClick={handleNextPage}
                  disabled={
                    loading || (resultCount !== null && resultCount === 0)
                  }
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {responseTime !== null && response !== null && (
            <div className="results-meta">
              Response time: {responseTime}ms
              {resultCount !== null && ` | ${resultCount} items returned`}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading</div>
          ) : response ? (
            <div className="json-container">
              <pre className="json-output">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="endpoint-info">
              Configure the parameters and click "Send Request" to fetch data
              from the SIS API.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
