import React from "react";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import AllTickets from "./components/AllTickets";
import "./ticketing.css";

const TicketingModule = () => {
  const theme = useLocalStorage("theme", "get");
  return (
    <div className={theme}>
      <AllTickets />
    </div>
  );
};

export default TicketingModule;
