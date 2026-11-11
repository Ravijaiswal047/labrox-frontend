import B2BConnectLayout from "./B2BConnectLayout";
import "./B2BConnectDashboard.css";

const getB2BUserData = () => {
  try {
    return JSON.parse(sessionStorage.getItem("b2b_userData") || "{}");
  } catch {
    return {};
  }
};

// /B2BConnect/Dashboard — first real screen behind the guard. Placeholder
// stat tiles from what the login response already carries (B2BLoginDto);
// the target-vs-achievement widget and promotional banner slot (section 7
// of the design proposal) land once the B2B Configuration admin screen and
// its APIs exist.
const B2BConnectDashboard = () => {
  const userData = getB2BUserData();

  return (
    <B2BConnectLayout title="Welcome">
      <div className="b2bc-dash-hero">
        <h2>Welcome back, {userData?.EmployeeName || userData?.Username || "there"}</h2>
        <p>
          This is your B2B Connect home. My Registrations, My Reports, My Money, My Rates,
          My Clients and Feedback are being built next — sign-in and this Dashboard are live today.
        </p>
      </div>

      <div className="b2bc-dash-grid">
        <div className="b2bc-dash-card">
          <span className="b2bc-dash-card-label">Client code</span>
          <strong>{userData?.Username || "—"}</strong>
        </div>
        <div className="b2bc-dash-card">
          <span className="b2bc-dash-card-label">Rate type</span>
          <strong>{userData?.RateTypeName || "—"}</strong>
        </div>
        <div className="b2bc-dash-card">
          <span className="b2bc-dash-card-label">Business unit</span>
          <strong>{userData?.BusinessUnit || "—"}</strong>
        </div>
        <div className="b2bc-dash-card">
          <span className="b2bc-dash-card-label">Has Sub-B2B</span>
          <strong>{userData?.IsSubPCC == 1 ? "Yes" : "No"}</strong>
        </div>
      </div>
    </B2BConnectLayout>
  );
};

export default B2BConnectDashboard;
