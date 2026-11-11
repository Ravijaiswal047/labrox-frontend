import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { useSelector } from "react-redux";
import ReactSelect from "../../components/formComponent/ReactSelect";

const ChangeCentre = () => {
  const { t } = useTranslation();
  const [labNo, setLabNo] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [centres, setCentres] = useState([]);

  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const centreData = res.data.message.map((ele) => ({
        value: ele.CentreID,
        label: ele.Centre,
      }));
      setCentres(centreData);
    } catch (error) {
      console.error("Error while fetching centres:", error);
    }
  };

  useEffect(() => {
    getAccessCentres();
  }, []);

  const fetchData = (searchLabNo) => {
    const searchNo = searchLabNo || labNo;
    if (!searchNo) return;

    setLoading(true);
    axiosInstance
      .get(`Centre/GetChangeTestCentreData?labNo=${searchNo}`)
      .then((res) => {
        const message = res?.data?.message;
        if (Array.isArray(message) && message.length > 0) {
          const formattedData = message.map((ele) => ({
            ...ele,
            newCentreID: "",
            newCentreName: "",
          }));
          setData(formattedData);
        } else {
          toast.error("No Data Found");
          setData([]);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || err?.message || "Something went wrong");
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  const handleCentreChange = (index, selectedOption) => {
    const updatedData = [...data];
    updatedData[index].newCentreID = selectedOption?.value;
    updatedData[index].newCentreName = selectedOption?.label;
    setData(updatedData);
  };
  const handleUpdate = (item) => {
    if (!item.newCentreID) {
      toast.error("Please select a new centre");
      return;
    }

    const payload = [
      {
        testID: item?.TestID,
        ledgertransactionno: item?.ledgertransactionno,
        oldCentreName: item?.Currentcentre,
        oldCentreID: item?.testCentreID,
        newCentreName: item?.newCentreName,
        newCentreID: item?.newCentreID,
        itemName: item?.TestName,
      },
    ];

    setLoading(true);
    axiosInstance
      .post("Centre/ChangeTestCentreData", payload)
      .then((res) => {
        toast.success(res?.data?.message || "Centre updated successfully");
        fetchData();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || err?.message || "Update failed");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (reprintLabNo) {
      setLabNo(reprintLabNo);
      fetchData(reprintLabNo);
    }
  }, [reprintLabNo]);

  return (
    <>
      <Accordion name={t("Change Centre")} isBreadcrumb={true} defaultValue={true}>
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <Input
              id="Lab No"
              lable={t("Visit No")}
              placeholder=" "
              type="text"
              value={labNo}
              onChange={(e) => setLabNo(e.target.value)}
            />
          </div>
          <div className="col-sm-1">
            <SearchButton
              text={t("Search")}
              onClick={() => fetchData()}
              disabled={labNo.length < 3}
            />
          </div>
        </div>
      </Accordion>

      {loading && <Loading />}

      {!loading && (
        <Accordion 
        title={t("Search Detail")} 
        defaultValue={true}
         notopen={true}
         linkTo="#"
        linkTitle={
          <>
          <div>
            <strong>Patient Name : {data[0]?.Pname} || </strong>
            <strong>Age : {data[0]?.age} || </strong>
            <strong>Gender : {data[0]?.gender}</strong>
            </div>
          </>
         }
         >
          {data.length > 0 ? (
            <Tables>
              <thead>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Current Centre")}</th>
                  <th>{t("New Centre")}</th>
                  <th>{t("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.TestName}</td>
                    <td>{item.Currentcentre}</td>
                    <td style={{ minWidth: "200px" }}>
                      <ReactSelect
                        dynamicOptions={centres}
                        name="CentreId"
                        id={`CentreId-${index}`}
                        removeIsClearable={true}
                        placeholderName={t("Select Centre")}
                        value={item.newCentreID}
                        onChange={(_, e) => handleCentreChange(index, e)}
                      />
                    </td>
                    <td>
                      <CustomButton
                        icon={"edit"}
                        text={t("Update")}
                        onClick={() => handleUpdate(item)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          ) : (
            <NoRecordFound />
          )}
        </Accordion>
      )}
    </>
  );
};

export default ChangeCentre;
