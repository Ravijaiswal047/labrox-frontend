import React, { useState } from "react";

const RatingComponent = ({
  label,
  totalStars = 5,
  initialRating = 0,
  activeColor = "#ffb400",
  inactiveColor = "#ccc",
  hoverColor = "#ffcc00",
  buttonText,
  onRatingChange,
  onButtonClick,
  containerClass,
  style,
  // Style control props
  labelClass = "text-sm font-semibold text-gray-700 whitespace-nowrap",
  starSize = 18,
  starSpacing = "space-x-2",
  buttonClass = "bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded",
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(null);

  const handleRating = (index) => {
    setRating(index);
    onRatingChange?.(index); // safe optional call
  };

  // Hide the whole component if no stars, label, or button is passed
  if (!label && !buttonText && totalStars <= 0) return null;

  return (
    <div className={containerClass}>
      {(label || totalStars > 0) && (
        <>
          {label && <label className={labelClass}>{label} :</label>}
          {totalStars > 0 && (
            <span className={`flex items-center ${starSpacing}`}>
              {[...Array(totalStars)].map((_, i) => {
                const starValue = i + 1;
                const isActive = starValue <= (hover || rating);

                return (
                  <i
                    key={starValue}
                    className={`fa ${isActive ? "fa-solid" : "fa-regular"
                      } fa-star cursor-pointer transition-transform duration-150`}
                    style={{
                      color: isActive
                        ? hover
                          ? hoverColor
                          : activeColor
                        : inactiveColor,
                      fontSize: `${starSize}px`,
                    }}
                    onClick={() => handleRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(null)}
                  ></i>
                );
              })}
            </span>
          )}
        </>
      )}
      {buttonText && (
        <button onClick={onButtonClick} className={buttonClass}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default RatingComponent;