import React from "react";
import classnames from "classnames";
import { usePagination } from "./usePagination";
import "./Pagination.css";

const Pagination = (props) => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className,
  } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

    console.log('xxxx:::', 
      // onPageChange,
    totalCount,
    siblingCount,
    currentPage,
    pageSize,
    className);

  // If there are less than 2 times in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange?.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(prev => prev + 1);
  };

  const onPrevious = () => {
    onPageChange(prev => prev - 1);
  };

  let lastPage = paginationRange[paginationRange?.length - 1];
  return (
    <div
      className={classnames("pagination-container", { [className]: className })}
    >
      {/* Left navigation arrow */}
      <span
        className={classnames("pagination-item", {
          disabled: currentPage === 1,
        })}
        onClick={onPrevious}
      >
        <div className="arrow left" />
      </span>
      {paginationRange?.map((pageNumber, index) => {
        return (
          <div
            key={pageNumber || index}
            className={classnames("pagination-item", {
              selected: pageNumber === currentPage,
            })}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </div>
        );
      })}

      {/*  Right Navigation arrow */}
      <div
        className={classnames("pagination-item", {
          disabled: currentPage === lastPage,
        })}
        onClick={onNext}
      >
        <div className="arrow right" />
      </div>
    </div>
  );
};

export default Pagination;
