import { useState } from "react";
import "./npsFeedback.css"
import { Card } from "react-bootstrap";
import Input from "../../../components/formComponent/Input";
import TextAreaInput from "../../../components/formComponent/TextAreaInput";
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton";

const NpsFeedback = () => {
    const [formData, setFormData] = useState({
        rating: '',
        message: ''
    })
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStarClick = (value) => {
        setFormData({
            ...formData,
            rating: value
        });
    };

    const handleSubmit = () => {
        setIsSubmitted(true)
    }

    const [feedbackHistory] = useState([
        {
            id: 1,
            rating: 5,
            label: 'Very Happy',
            message: 'Excellent service! The staff was very helpful and professional. Highly recommended.',
            date: '2 days ago'
        },
        {
            id: 2,
            rating: 4,
            label: 'Happy',
            message: 'Good experience overall. Quick service and friendly staff.',
            date: '1 week ago'
        },
        {
            id: 3,
            rating: 3,
            label: 'Neutral',
            message: 'Average service. Could be improved with better waiting time management.',
            date: '2 weeks ago'
        },
        {
            id: 4,
            rating: 5,
            label: 'Very Happy',
            message: 'Amazing experience! Very satisfied with the quality of service.',
            date: '3 weeks ago'
        },
        {
            id: 5,
            rating: 4,
            label: 'Happy',
            message: 'Professional staff and clean facility. Will visit again.',
            date: '1 month ago'
        },
        {
            id: 6,
            rating: 4,
            label: 'Happy',
            message: 'Professional staff and clean facility. Will visit again.',
            date: '1 month ago'
        },
        {
            id: 7,
            rating: 4,
            label: 'Happy',
            message: 'Professional staff and clean facility. Will visit again.',
            date: '1 month ago'
        },
        {
            id: 8,
            rating: 4,
            label: 'Happy',
            message: 'Professional staff and clean facility. Will visit again.',
            date: '1 month ago'
        },
        {
            id: 9,
            rating: 4,
            label: 'Happy',
            message: 'Professional staff and clean facility. Will visit again.',
            date: '1 month ago'
        }
    ]);

    const starRatings = [1, 2, 3, 4, 5];

    return (

        <div className="nps-container">
            {!isSubmitted ? (
                <Card className="nps-form">
                    <div className="form-header">
                        <h5 className="form-title">NPS Feedback</h5>
                    </div>
                    <div className="">
                        <div className="star-section">
                            <label className="star-label">How was your experience?</label>

                            <div className="star-container">
                                {starRatings.map((star) => (
                                 <i
                                    key={star}
                                    className={`bi ${
                                    star <= formData.rating ? "bi-star-fill" : "bi-star"
                                    } star-icon`}
                                    onClick={() => handleStarClick(star)}
                                ></i>
                                ))}
                            </div>
                            </div>

                        <div className="col-12 col-sm-12 mb-3">
                            <TextAreaInput
                                style={{ height: "100px", padding: "6px" }}
                                id="message"
                                lable="Message"
                                onChange={handleChange}
                                value={formData?.message}
                                name="message"
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

            <div className="history-feedback">
                <div className="form-header">
                    <h5 className="form-title">Previous Feedback</h5>
                </div>
                {feedbackHistory.length > 0 ? (
                    feedbackHistory.map((feedback) => (
                        <Card className="feedback-card" key={feedback.id}>
                            <div className="feedback-header">
                                <div className="feedback-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                        key={star}
                                        className={`bi ${
                                        star <= feedback.rating ? "bi-star-fill" : "bi-star"
                                        } feedback-icon`}
                                    ></i>
                                    ))}
                                </div>
                                <span className="feedback-date">{feedback.date}</span>
                            </div>
                            <p className="feedback-message">{feedback.message}</p>
                        </Card>
                    ))
                ) : (
                    <div className="no-feedback">
                        No previous feedback available
                    </div>
                )}
            </div>
        </div>
    )
}

export default NpsFeedback;