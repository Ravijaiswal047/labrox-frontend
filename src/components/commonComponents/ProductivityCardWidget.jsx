import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/ustil2";
import {
  GrothChart,
  GrowthGraphSVGICON,
  LossChart,
  LossGraphSVGICON,
  NutralGraph,
} from "../SvgIcons";

export function ProductivityCardWidget({ stat }) {
  const [t] = useTranslation();
  const getLightColor = () => {
    const r = Math.floor(230 + Math.random() * 25);
    const g = Math.floor(230 + Math.random() * 25);
    const b = Math.floor(230 + Math.random() * 25);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  };

  const getDarkColor = () => {
    const r = Math.floor(140 + Math.random() * 200);
    const g = Math.floor(180 + Math.random() * 200);
    const b = Math.floor(150 + Math.random() * 200);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  };

  const getGradient = () => {
    const angle = 275;
    const lightColor = getLightColor();
    const darkColor = getDarkColor();
    const stop1 = Math.floor(5 + Math.random() * 15);
    const stop2 = 100;

    return `linear-gradient(${angle}deg, ${lightColor} ${stop1}%, ${darkColor} ${stop2}%)`;
  };

  return (
    <>
      <style>{`
        .responsive-productivity-container {
          width: 100%;
          height: 100%;
          min-height: clamp(120px, 15vh, 200px);
        }
        .responsive-productivity-widget {
          background: #fcfcfc;
          padding: clamp(0.75rem, 2vw, 1.4rem);
          border-radius: 0.5rem;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: clamp(120px, 15vh, 200px);
        }
        .responsive-productivity-widget-loss {
          background: #fcfcfc;
          padding: clamp(0.75rem, 2vw, 1.4rem);
          border-radius: 0.5rem;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: clamp(120px, 15vh, 200px);
        }
        .responsive-productivity-widget-neutral {
          background: #fcfcfc;
          padding: clamp(0.75rem, 2vw, 2rem);
          border-radius: 0.5rem;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: clamp(120px, 15vh, 200px);
        }
        .responsive-widget-header {
          margin-bottom: clamp(0.5rem, 2vh, 1rem);
          flex-shrink: 0;
        }
        .responsive-widget-title {
          color: #111827;
          font-size: clamp(0.875rem, 2.5vw, 1.125rem);
          font-weight: 600;
          margin: 0;
          margin-left: -8px;
        }
        .responsive-widget-title-secondary {
          color: #9ca3af;
        }
        .responsive-widget-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: clamp(0.5rem, 2vw, 1rem);
          flex: 1;
          min-height: 0;
        }
        .responsive-metrics-section {
          margin-left: -8px;
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .responsive-main-metric {
          margin-bottom: auto;
        }
        .responsive-main-metric-value {
          font-size: clamp(1.125rem, 4vw, 1.5rem);
          font-weight: 600;
          line-height: 1.1;
          color: #111827;
          display: block;
          margin-bottom: clamp(0.5rem, 1vh, 0.75rem);
          word-break: break-all;
        }
        .responsive-main-metric-values {
          font-size: clamp(0.875rem, 3vw, 1.125rem);
          font-weight: 600;
          line-height: 1.1;
          color: #111827;
          display: block;
          margin-bottom: clamp(0.5rem, 1vh, 0.75rem);
          word-break: break-all;
        }
        .responsive-percentage-change {
          flex-direction: column;
          display: flex;
          align-items: flex-start;
          gap: clamp(0.25rem, 1vw, 0.5rem);
          flex-wrap: wrap;
          margin-top: auto;
        }
        .responsive-percentage-icon {
          width: clamp(0.875rem, 2vw, 1rem);
          height: clamp(0.875rem, 2vw, 1rem);
          background-color: #10b981;
          border-radius: 0.125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: clamp(0.625rem, 1.5vw, 0.75rem);
        }
        .responsive-percentage-icon-red {
          width: clamp(0.875rem, 2vw, 1rem);
          height: clamp(0.875rem, 2vw, 1rem);
          background-color: red;
          border-radius: 0.125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .responsive-percentage-value {
          color: #10b981;
          font-weight: 500;
          white-space: nowrap;
          font-size: clamp(1.05rem, 2vw, 1.275rem);
        }
        .responsive-percentage-label {
          color: #000000;
          white-space: nowrap;
          font-size: clamp(0.625rem, 1.5vw, 0.75rem);
        }
        .responsive-chart-container {
          position: relative;
          width: clamp(60px, 25%, 120px);
          height: clamp(40px, 8vh, 80px);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .responsive-chart-percentage {
          color: #111827;
          font-weight: 500;
          font-size: clamp(0.75rem, 2vw, 1rem);
          line-height: 1.2;
          text-align: right;
          position: absolute;
          top: -clamp(15px, 3vh, 25px);
          right: -clamp(5px, 1vw, 10px);
          z-index: 2;
        }
        .responsive-chart-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .loss-chart-graph {
          margin-left: 9px;
          margin-top: -3px;
        }
        @media (max-width: 768px) {
          .responsive-widget-content {
            gap: 0.5rem;
            margin-left: 10px;
          }
          .responsive-widget-title {
            margin-left: 2px;
          }
          .responsive-chart-container {
            width: clamp(50px, 20%, 100px);
            height: clamp(35px, 6vh, 70px);
          }
        }
        @media (max-width: 480px) {
          .responsive-percentage-change {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          .responsive-chart-container {
            width: clamp(45px, 18%, 80px);
            height: clamp(30px, 5vh, 60px);
          }
        }
      `}</style>
      <div className="responsive-productivity-container">
        <div
          className={
            stat?.percentage === 0
              ? "responsive-productivity-widget-neutral"
              : stat?.isGroth
                ? "responsive-productivity-widget"
                : "responsive-productivity-widget-loss"
          }
          style={{ background: getGradient() }}
        >
          <div className="responsive-widget-header">
            <h2 className="responsive-widget-title">
              {t(stat?.title)}{" "}
              <span className="responsive-widget-title-secondary"></span>
            </h2>
          </div>

          <div className="responsive-widget-content">
            <div className="responsive-metrics-section">
              <div className="responsive-main-metric">
                <span
                  className={`${stat?.value && stat?.value.toString().length > 8
                    ? "responsive-main-metric-values"
                    : "responsive-main-metric-value"
                    }`}
                >
                  {formatCurrency(
                    stat?.value ? stat?.value : "0",
                    stat?.centreCurrency,
                    stat
                  )}
                </span>
              </div>

              <div className="responsive-percentage-change">
                <span
                  className="responsive-percentage-value"
                  style={{
                    color:
                      stat?.percentage === 0
                        ? "black"
                        : stat?.isGroth
                          ? "green"
                          : "red",
                  }}
                >
                  {formatCurrency(
                    stat?.PTAmt ? stat?.PTAmt : 0,
                    stat?.centreCurrency,
                    stat
                  )}
                </span>
                <span className="responsive-percentage-label">
                  {stat?.comperisionText ? stat?.comperisionText : "last Month"}
                </span>
              </div>
            </div>

            <div className="responsive-chart-container">
              <div className="responsive-chart-wrapper">
                <div
                  className={`${!stat?.isGroth && "loss-chart-graph"} responsive-chart-percentage`}
                  style={{
                    color:
                      stat?.percentage === 0
                        ? "black"
                        : stat?.isGroth
                          ? "green"
                          : "red",
                  }}
                >
                  {stat?.percentage}%
                </div>
                {stat?.percentage === 0 ? (
                  <NutralGraph />
                ) : stat?.isGroth ? (
                  <GrothChart />
                ) : (
                  <LossChart />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
