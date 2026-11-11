import { useTranslation } from "react-i18next";
import "./NextGenButton.css";

const VARIANT_CLASS = {
  primary: "ng-btn--primary",
  danger: "ng-btn--danger",
  secondary: "ng-btn--secondary",
  ghost: "ng-btn--ghost",
  success: "ng-btn--success",
  warning: "ng-btn--warning",
  info: "ng-btn--info",
};

export function NextGenButton({
  text,
  icon,
  onClick,
  type = "button",
  className = "",
  variant = "primary",
  size = "sm",
  disabled = false,
  loading = false,
  ...rest
}) {
  const { t } = useTranslation();
  return (
    <button
      type={type}
      className={`ng-btn ng-btn--${size} ${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={text}
      {...rest}
    >
      {loading ? (
        <span className="ng-btn__spinner" aria-hidden="true" />
      ) : (
        icon && <span className="ng-btn__icon">{icon}</span>
      )}
      {text ? t(text) : null}
    </button>
  );
}

export function NextGenSaveButton({ text = "Save", ...rest }) {
  return <NextGenButton variant="primary" text={text} {...rest} />;
}

export function NextGenCancelButton({ text = "Cancel", ...rest }) {
  return <NextGenButton variant="secondary" text={text} {...rest} />;
}

export default NextGenButton;
