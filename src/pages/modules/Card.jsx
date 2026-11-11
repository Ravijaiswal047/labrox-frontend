import React from "react";
// import { Col, Infobox } from "adminlte-2-react";

const data = [
  {
    icon: "fab-google-plus-g",
    color: "aqua",
    number: [90, <small key="temp">%</small>],
    text: "TOTAL REGISTRATION",
  },
  {
    icon: "fab-google-plus-g",
    color: "red",
    number: "41,410",
    text: "EARNINGS (MONTHLY)",
  },
  {
    icon: "fab-google-plus-g",
    color: "green",
    number: "760",
    text: "TOTAL DISCOUNT",
  },
  {
    icon: "fab-google-plus-g",
    color: "yellow",
    number: "2,000",
    text: "APPROVAL PENDING",
  },
];

const Card = ({ data }) => {
  const dataMap = [
    {
      icon: <i className="fa fa-registered" aria-hidden="true"></i>,
      color: "bg-info",
      number: data?.registrationCount?.toFixed(2),
      text: "TOTAL REGISTRATION",
    },
    {
      icon: <i className="fa fa-money" aria-hidden="true"></i>,
      color: "bg-danger",
      number: data?.totalEarning?.toFixed(2),
      text: "EARNINGS (MONTHLY)",
    },
    {
      icon: "%",
      color: "bg-success",
      number: data?.totalDiscount?.toFixed(2),
      text: "TOTAL DISCOUNT",
    },
    {
      icon: <i className="fa fa-pencil" aria-hidden="true"></i>,
      color: "bg-warning",
      number: data?.samplePendingCount?.toFixed(2),
      text: "APPROVAL PENDING",
    },
  ];

  return dataMap.map((props, index) => (
    // <div></div>
    // eslint-disable-next-line react/no-array-index-key
    // <Col key={`upperInfoBox${index}`} xs={12} sm={6} md={3}>
    //   <div class="info-box">
    //     <span class={`info-box-icon ${props?.color}`}>{props?.icon}</span>
    //     <div class="info-box-content">
    //       <span class="info-box-text">{props?.text}</span>
    //       <span class="info-box-number">{props?.number}</span>
    //     </div>
    //   </div>
    // </Col>
    <div></div>
  ));
};

export default Card;
