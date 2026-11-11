import React from "react";
import { Dialog } from "primereact/dialog";

const LabIssueModal = ({
  show,
  reviewModal,
  closeReviewModal,
  handleSaveReview,
  setReviewModal,
  theme,
  t,
}) => {
  if (!show) return null;

  return (
    <Dialog
      header={
        <div style={{ color: "white" }}>
          {t("Issues")}
          {reviewModal?.rowData?.TestName && (
            <span
              style={{
                fontSize: "13px",
                marginLeft: "8px",
                opacity: 0.85,
              }}
            >
              - {reviewModal.rowData.TestName}
            </span>
          )}
        </div>
      }
      visible={show}
      style={{ width: "35vw", minWidth: "320px" }}
      className={theme}
      onHide={closeReviewModal}
      draggable={false}
    >
      <div className="row p-2">
        <div className="col-12">
          <div className="form-group">
            <label
              className="lable"
              style={{
                fontWeight: "600",
                marginBottom: "6px",
                display: "block",
              }}
            />

            <textarea
              id="reviewTextArea"
              className="form-control select-focus"
              rows={4}
              style={{
                resize: "vertical",
                borderRadius: "6px",
                fontSize: "14px",
                padding: "8px 10px",
              }}
              placeholder={t("Enter Issues here...")}
              value={reviewModal.reviewText}
              onChange={(e) =>
                setReviewModal((prev) => ({
                  ...prev,
                  reviewText: e.target.value,
                }))
              }
              autoFocus
            />
          </div>
        </div>
      </div>

      <div
        className="d-flex justify-content-end mt-2 px-2 pb-1"
        style={{ gap: "8px" }}
      >
        <button
          type="button"
          className="btn btn-success btn-sm rounded px-3"
          onClick={handleSaveReview}
          disabled={reviewModal.loading}
        >
          {reviewModal.loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm mr-2"
                role="status"
                aria-hidden="true"
              />
              {t("Saving...")}
            </>
          ) : (
            <>
              <i className="fa fa-save mr-1" />
              {t("Save")}
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm rounded px-3"
          onClick={closeReviewModal}
          disabled={reviewModal.loading}
        >
          <i className="fa fa-times mr-1" />
          {t("Cancel")}
        </button>
      </div>
    </Dialog>
  );
};

export default LabIssueModal;