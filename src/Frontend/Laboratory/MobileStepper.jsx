import React, { useState, useEffect } from 'react';
import "./MobileStepper.css"

const MobileStepper = ({ 
  stepLabels = ['Step 1', 'Step 2', 'Step 3'],
  children 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const childrenArray = React.Children.toArray(children);
  const totalSteps = childrenArray.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Desktop view - show all children normally
  if (!isMobile) {
    return <div className="desktop-view">{children}</div>;
  }

  // Mobile view - show stepper
  return (
    <div className="mobile-stepper-container">
      {/* Stepper Header */}
      <div className="stepper-header">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={`stepper-item ${
              currentStep > index + 1 ? 'completed' : ''
            } ${currentStep === index + 1 ? 'active' : ''}`}
          >
            <div className="step-number">
              {currentStep > index + 1 ? '✓' : index + 1}
            </div>
            {/* <div className="step-label">
              {stepLabels[index] || `Step ${index + 1}`}
            </div> */}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="stepper-content">
        {childrenArray[currentStep - 1]}
      </div>

      {/* Navigation Buttons */}
      <div className="stepper-buttons">
        <button
          className="btn btn-prev"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          ← Previous
        </button>
        {currentStep != totalSteps && (
        <button
          className="btn btn-next"
          onClick={handleNext}
          disabled={currentStep === totalSteps}
        >
          {currentStep === totalSteps ? 'Finish' : 'Next →'}
        </button>
        )}
      </div>
    </div>
  );
};

export default MobileStepper;