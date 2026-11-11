import React from 'react'
import {
    CheckmarkSVG, CircleTimerSVG, DischargeIntimationIcon,
    PharmacyClearanceIcon,
    BillInProcessIcon,
    DischargedIcon,
    DelaySVG,
} from '../SvgIcons'

export default function CustomTracker({ status, color, timeDiff, dateTime }) {

    // let status = "completed"
    // const backGroundColor = (status) => {
    //     if (status === "pending") {
    //         return "#ff8c00"
    //     } else if (status === "completed") {
    //         return "#0bba0b"
    //     }
    //     return ""
    // }
    console.log("timeDiff", dateTime, timeDiff)
    return (<>

        <div className="custom-tracker-container py-2">
            <div className={`custom-tracker-line ${color}`} ></div>

            <div className={`custom-tracker-circle-wrapper ${color} ${status === "pending" ? "blink-background-discharge-tracker" : ""}`} >
                {/* <CircleTimerSVG /> */}
                {status === "pending" && <CircleTimerSVG />}
                {status === "Not-Started" && <CircleTimerSVG />}
                {status === "delayed" && <DelaySVG />}
                {status === "completed" && <CheckmarkSVG />}
                {/* <DischargeIntimationIcon/> */}
                {/* <PharmacyClearanceIcon/> */}
                {/* <BillInProcessIcon/> */}
                {/* <DischargedIcon/> */}
            </div>

            <div className={`custom-tracker-line ${color}`} ></div>
        </div>
        {timeDiff !== null && <p className={`custom-tracker-time text-center mb-1`} >{dateTime ? dateTime : <>&nbsp;</>}  <strong>({timeDiff} Min.)</strong>  </p>}
    </>
    )
}
