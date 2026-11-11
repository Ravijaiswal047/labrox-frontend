// import React from "react";

// export default function FeedBAckMaster() {
//     return (
//         <div>
            
//         </div>
//     );
// }




import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./FeedBackMaster.css"
import { Card } from "react-bootstrap";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const FeedBAckMaster = () => {
    const [formData, setFormData] = useState({
        Rating: '',
        Message: ''
    })
    const [isSubmitted, setIsSubmitted] = useState(false)

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const ledgerTransactionIDHash = queryParams.get("LedgertransactionIDHash");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStarClick = (value) => {
        setFormData({
            ...formData,
            Rating: value
        });
    };

    const handleSubmit = () => {
        if (!formData.Rating) {
            toast.error("Please provide a rating");
            return;
        }
        const payload = {
            ledgerTransactionHash: ledgerTransactionIDHash || "1256fba5-9f44-a28f-fcbf-df33-6501b40f",
            feedbackPoints: formData.Rating,
            feedbackRemarks: formData.Message
        };
        console.log("Submitting feedback with payload:", payload);
        axiosInstance.post("CommonController/SubmitPatientFeedback", payload).then((res) => {
            if (res.data.success) {
                toast.success(res.data.message);
                setIsSubmitted(true)
            } else {
                toast.error(res.data.message);
            }
        }).catch((err) => {
            console.error(err);
            toast.error("Something went wrong");
        })
    }

    const starRatings = [1, 2, 3, 4, 5];

    return (

        <div className="nps-container">
            {!isSubmitted ? (
                <Card className="nps-form">
                    <div className="form-header">
                        <h5 className="form-title">Feedback</h5>
                    </div>
                    <div className="">
                        <div className="star-section">
                            <label className="star-label">How was your experience?</label>

                            <div className="star-container">
                                {starRatings.map((star) => (
                                 <i
                                    key={star}
                                    className={`bi ${
                                    star <= formData.Rating ? "bi-star-fill" : "bi-star"
                                    } star-icon`}
                                    onClick={() => handleStarClick(star)}
                                ></i>
                                ))}
                            </div>
                            </div>

                        <div className="col-12 col-sm-12 mb-3">
                            <TextAreaInput
                                style={{ height: "100px", padding: "6px" }}
                                id="Message"
                                lable="Message"
                                onChange={handleChange}
                                value={formData?.Message}
                                name="Message"
                            />
                        </div>
                        <div className="col-12 col-sm-12 mb-3">
                            <CustomButton
                                text={"Submit"}
                                icon={"share"}
                                onClick={handleSubmit}
                            />
                        </div>

                    </div>
                </Card>
            ) : (
                <Card className="nps-form">
                    <div className="d-flex justify-content-center flex-column align-items-center">
                        <div className="check bg-color-container">
                            <i className="bi bi-check2 fs-6 check-icon" />
                        </div>
                        <p className="submitted-text">The feedback has been submitted.</p>
                    </div>
                </Card>
            )}

        </div>
    )
}

export default FeedBAckMaster;