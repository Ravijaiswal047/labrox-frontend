import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
const RevertDiscountApprovalStatus = () => {
  const [input, setInput] = useState({
    labNo: "",
  });
  const [data, setData] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const { t } = useTranslation();
  const fetch = () => {
    setSearchLoading(true);
    axiosInstance
      .post("RevertDiscountApprovalStatus/SearchRevertData", {
        labNo: input?.labNo?.trim(),
      })
      .then((res) => {
        const data = res?.data?.message;
        if (data.length > 0) {
          setData(data);
        } else {
          toast.error("No Data Found");
        }
        setSearchLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
        setSearchLoading(false);
      });
  };

  const handleReset = (id) => {
    axiosInstance
      .post("RevertDiscountApprovalStatus/UpdateRevertStatus", {
        labId: id,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setData([]);
        setInput({ labNo: "" });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
      });
  };
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      fetch(e);
    }
  };
  return (
    <>
      <Accordion
        name={t("Revert Discount Approval Status")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <Input
              id="Lab No"
              lable="Lab Number"
              placeholder=" "
              type="text"
              name="labNo"
              onKeyDown={handleKeyDown}
              value={input.labNo}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-1 ">
            <SearchButton
              text={"Search"}
               onClick={fetch}
              disabled={input?.labNo.length > 3 ? false : true}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title="Search Detail" defaultValue={true}>
        {searchLoading ? (
          <Loading />
        ) : data.length > 0 ? (
          <>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Lab No")}</th>
                  <th>{t("PName")}</th>
                  <th>{t("Date")}</th>
                  <th>{t("DiscountApprovedByName")}</th>
                  <th>{t("NetAmount")}</th>
                  <th>{t("DiscountOnTotal")}</th>
                  <th>{t("STATUS")}</th>
                  <th>{t("IsDiscountApproved")}</th>
                  <th>{t("DiscountStatus")}</th>
                  <th>{t("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Lab No")}>
                        {item.LedgertransactionNo}&nbsp;
                      </td>

                      <td data-title={t("PName")}>{item?.PName}&nbsp;</td>
                      <td data-title={t("Date")}>{item.DATE}&nbsp;</td>
                      <td data-title={t("DiscountApprovedByName")}>
                        {item.DiscountApprovedByName}&nbsp;
                      </td>
                      <td data-title={t("NetAmount")}>
                        {item.NetAmount}&nbsp;
                      </td>
                      <td data-title={t("DiscountOnTotal")}>
                        {item.DiscountOnTotal}&nbsp;
                      </td>
                      <td data-title={t("STATUS")}>{item.STATUS}&nbsp;</td>
                      <td data-title={t("IsDiscountApproved")}>
                        {item.IsDiscountApproved}&nbsp;
                      </td>
                      <td data-title={t("DiscountStatus")}>
                        {item.DiscountStatus}&nbsp;
                      </td>
                      <td data-title={t("Action")}>
                        
                          <CustomButton
                            text={"Reset Status"}
                            disabled={
                            item?.IsDiscountApproved == 0 ||
                            item?.DiscountOnTotal == 0
                          }
                          onClick={() => handleReset(item.LedgertransactionId)}
                          />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Tables>
          </>
        ) : (
          <>
            {" "}
            <NoRecordFound />{" "}
          </>
        )}
      </Accordion>
    </>
  );
};

export default RevertDiscountApprovalStatus;
