import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import './Breadcrub.css'


export default function Breadcrumb({ name, backButton }) {
  const location = useLocation();
  const navigate = useNavigate()

  const handleBack=(e)=>{
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }

    navigate(-1)
  }

  return (
    <div className="cursor-pointer font-weight-bold ml-1 text-nowrap d-flex align-items-center">
      {backButton && <span onClick={handleBack} className="back_breadcrub"><i style={{marginRight:'6px'}} className="bi bi-arrow-left  mb-0"></i></span>}
      <i className="fa fa-home" aria-hidden="true"></i>
      {/* {location?.state?.data} */}
      &nbsp; {name}
    </div>
  );
}
