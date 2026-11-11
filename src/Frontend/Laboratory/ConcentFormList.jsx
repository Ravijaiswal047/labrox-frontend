import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SeeFormImage from "../utils/SeeFormImage";

const ConcentFormList = () => {
  const [tableData, setTableData] = useState([]);

  console.log("document-active",tableData)
  const [tableData1, setTableData1] = useState([]);
  const [loading, setLoading] = useState({
    type: "",
    laod: false,
  });
  const [load, setLoad] = useState(false);
  const [formUrl, setFormurl] = useState("");
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [documentId, setDocumentID] = useState("");
  const [pageType, setPageType] = useState(true);
  const [payload, setPayload] = useState({
    name: "",
    fileName: "",
    url: "",
  });

  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  const guidNumber = () => {
    const guidNumber =
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4();

    setDocumentID(guidNumber);
  };

  const getBindConcentForm = () => {
    setLoad(true);
    axiosInstance
      .get("ConcentFormMaster/BindConcentForm")
      .then((res) => {
        const data = res?.data?.message?.map((ele) => {
          return {
            formid: "",
            name: "",
            fieldsId: ele?.id,
            FieldsName: ele?.Fieldsname,
            Left: "",
            Top: "",
            fontname: "Aharoni",
            fontsize: "8",
            isbold: 0,
            isPrint: 0,
          };
        });
        setTableData1(data);
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };

  const Fetch = async (guidNumber, pageName) => {
    const response = await axiosInstance.post("CommonController/GetDocument", {
      Page: pageName,
      Guid: guidNumber,
    });
    return response?.data?.message;
  };

  const getS3url = async (id) => {
    const response = await axiosInstance.post("CommonController/GetFileUrl", {
      Key: id,
    });
    return response?.data?.message;
  };

  const GetConcentFormData = async () => {
    setLoading({ type: "Search", laod: true });
    try {
      const res = await axiosInstance.get(
        `ConcentFormMaster/GetConcentFormData?isActive=2`,
      );
      const data = res?.data?.message;
      const promises = data.map(async (ele) => {
        const response = await Fetch(ele?.guidNumber, "ConcentFormMaster");
        return {
          ...ele,
          Filename: response[0]?.FileName,
          awsKey: response[0]?.awsKey,
        };
      });

      const tableData = await Promise.all(promises);
      setLoading({ type: "", laod: false });

      setTableData(tableData);
    } catch (err) {
      setLoading({ type: "", laod: false });
      console.error(err);
    }
  };

  const editIDMaster = async (id, awsKey) => {
    setLoading({ type: "Search", laod: true });
    try {
      const res = await axiosInstance.post(
        "ConcentFormMaster/GetConcentFormDataById",
        { id: id },
      );
      const data = res?.data?.message;
      const { ConcentFormData, ConcentInvestigation } = data;
      const promises = ConcentFormData.map(async (ele) => {
        const response = await getS3url(awsKey);
        return {
          ...ele,
          url: response,
        };
      });
      setPayload({
        name: ConcentFormData[0].concentformname,
        fileName: "",
      });
      const tableData = await Promise.all(promises);
      setLoading({ type: "", laod: false });
      setDocumentID(tableData[0]?.guidNumber);
      setPayload(tableData[0]);
      setTableData1(ConcentFormData);
      setPageType(false);
    } catch (err) {
      setLoading({ type: "", laod: false });
      console.error(err);
    }
  };

  const handlePreviewImage = async (guidNumber) => {
    setLoading({ type: "Preview", laod: true });
    const response = await Fetch(guidNumber, "ConcentFormMaster");
    const imgURL = await getS3url(response[0]?.awsKey);
    console.log(imgURL);
    setFormurl(imgURL);
    setShow(true);
  };

  useEffect(() => {
    guidNumber();
    getBindConcentForm();
    GetConcentFormData();
  }, []);

  const closemodal = () => {
    setShow(false);
    setFormurl("");
  };

  const handleStatusUpdate = (data, status) => {
    setLoad(true);
    axiosInstance
      .post("ConcentFormMaster/DeActivateConcentForm", {
        id: data,
        isActive: status,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        GetConcentFormData();
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(err?.response?.data?.message);
      });
  };

  return (
    <>
      {show && (
        <SeeFormImage show={show} handleShow={closemodal} data={formUrl} />
      )}
      <Accordion
        name={t("Concent Form List ")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo="/ConcentFormMaster"
        linkTitle={t("Create New")}
        state={{
          url: "",
        }}
      >
        <div className="row p-2">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("S No.")}</th>
                  <th>{t("Form Name")}</th>
                  <th>{t("File Name")}</th>
                  <th>{t("Entry Date")}</th>
                  <th>{t("Edit")}</th>
                  <th>{t("View")}</th>
                  <th>{t("Active Status")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((ele, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{ele?.concentformname}</td>
                    <td>{ele?.Filename}</td>
                    <td>{ele?.endate}</td>
                    <td>
                      <Link
                        to="/ConcentFormMaster"
                        state={{
                          id: ele?.id,
                          awskey: ele?.awsKey,
                        }}
                      >
                        {t("Select To Edit")}
                      </Link>
                    </td>
                    <td
                      onClick={() => {
                        handlePreviewImage(ele?.guidNumber);
                      }}
                    >
                      <i className="pi pi-search" />
                    </td>
                    <td>
                      {ele?.ActiveStatus == "Active" ? (
                        <button
                          type="button"
                          className="col-sm-4 btn btn-block btn-danger btn-sm"
                          onClick={() => handleStatusUpdate(ele?.id, 0)}
                        >
                          {t("Active")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="col-sm-4 btn btn-block btn-success btn-sm"
                          onClick={() => handleStatusUpdate(ele?.id, 1)}
                        >
                          {t("InActive")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ConcentFormList;
