import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import "./Header.css";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useSelector } from "react-redux";
import { formatIndianNumber } from "../../utils/utils";
import { formatCurrency } from "../../utils/helpers";

const BalanceMenu = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [openByClick, setOpenByClick] = useState(false);
  const localData = useLocalStorage("userData", "get");

  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;

  const { data: balance = {} } = useSelector(
    (state) => state?.balaceSlice || {},
  );

  const [billingAmt, receivedAmt, creditLimit, currentBalance] = (
    balance?.outstandingAmount || ""
  ).split("#");

  const handleMouseEnter = () => {
    if (!openByClick) setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    if (!openByClick) setShowDropdown(false);
  };

  const handleToggleClick = () => {
    const nextState = !showDropdown;
    setShowDropdown(nextState);
    setOpenByClick(nextState);
  };

  if (!(localData?.ShowBalanceAmount > 0)) return null;

  return (
    <div className="balance_box p-0 d-flex align-items-center">
      <Dropdown
        show={showDropdown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Dropdown.Toggle
          id="dropdown-basic"
          className="rounded-0"
          onClick={handleToggleClick}
        >
          <span className="d-sm-block d-none">Balance :</span>
          <strong>
            {DefaultCurrencyName == "KES" ? "KES  " : "₹"}
            {DefaultCurrencyName == "KES"
              ? formatCurrency(currentBalance || 0)
              : formatIndianNumber(currentBalance || 0)}
          </strong>
        </Dropdown.Toggle>

        <Dropdown.Menu className="bg-grey">
          <Dropdown.ItemText>
            Billing Amount :{" "}
            <strong>{DefaultCurrencyName == "KES" ? "KES  " : "₹"}{DefaultCurrencyName == "KES" ? formatCurrency(billingAmt || 0) : formatIndianNumber(billingAmt || 0)}</strong>
          </Dropdown.ItemText>
          <Dropdown.ItemText>
            Received Amount :{" "}
            <strong>{DefaultCurrencyName == "KES" ? "KES  " : "₹"}{DefaultCurrencyName == "KES" ? formatCurrency(receivedAmt || 0) : formatIndianNumber(receivedAmt || 0)}</strong>
          </Dropdown.ItemText>
          <Dropdown.ItemText> 
            Credit Limit :{" "}
            <strong>{DefaultCurrencyName == "KES" ? "KES  " : "₹"}{DefaultCurrencyName == "KES" ? formatCurrency(creditLimit || 0) : formatIndianNumber(creditLimit || 0)}</strong>
          </Dropdown.ItemText>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default BalanceMenu;
