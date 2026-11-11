import React, { useState, useEffect } from "react";

function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      // If there is no actual JS error object, ignore — this is a browser/lib quirk (e.g. CKEditor)
      if (!event?.error) return;

      const msg = event.error.message || "";
      // Suppress known CKEditor 4 initialization race-condition errors by message
      const knownCKEditorErrors = ["unselectable", "Cannot read properties of null"];
      if (knownCKEditorErrors.some((e) => msg.includes(e))) return;
      // Suppress errors whose source script is ckeditor
      if (event?.filename?.toLowerCase().includes("ckeditor")) return;

      setError(event.error);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (error) {
    return (
      <>
        <div className="errorBoundary">
          <div>
            <h2>Something went wrong:</h2>
            <p>Error message: {error.message}</p>
            <p>Error stack trace:</p>
            <pre>{error.stack}</pre>
          </div>
        </div>
      </>
    );
  }

  return children;
}

export default ErrorBoundary;
