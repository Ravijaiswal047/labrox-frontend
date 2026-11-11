import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";

const Footer = () => {
  const [t] = useTranslation();
//hello
  return (
    <footer className="main-footer w-100">
      <strong>
        <span>
          {t("Copyright")} © {DateTime.now().toFormat("y")}{" "}
        </span>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("LabRox New Gen Software")}
        </a>
        <span>.</span>
      </strong>
      <div className="float-right d-none d-sm-inline-block">
        <strong>
          {" "}
          <a
            href={"#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("LabRox")}
          </a>{" "}
        </strong>
        &nbsp;<b>{t("Version")} </b> <span>&nbsp;LIMS 9.0</span>
      </div>
    </footer>
  );
};

export default Footer;
