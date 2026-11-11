import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import {
  BindGroupToken,
  BindRoomList,
  bindDepartment,
} from "../../utils/NetworkApi/commonApi";
import { RoomMapValidation, RoomTypeValidation } from "../../utils/Schema";

import Heading from "../../components/UI/Heading";
import { axiosInstance } from "../../utils/axiosInstance";
const ScRoomMaster = () => {
  const { t } = useTranslation();
  const [payloadRoom, setPayloadRoom] = useState({
    RoomName: "",
    RoomType: "",
  });
  const [payloadMap, setPayloadMap] = useState({
    RoomId: "",
    GroupId: "",
  });
  const [roomType, setRoomType] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [err, setErr] = useState("");
  const [error, setError] = useState("");
  const [room, setRoom] = useState([]);
  const [groupToken, setGroupToken] = useState([]);
  const [load, setLoad] = useState({
    saveRoom: false,
    saveMap: false,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;

    setPayloadRoom({
      ...payloadRoom,
      [name]: value,
    });
  };
  const handleChangeMap = (e) => {
    const { name, value } = e.target;

    setPayloadMap({
      ...payloadMap,
      [name]: value,
    });
  };

  const handleSaveRoom = () => {
    const generatedError = RoomTypeValidation(payloadRoom);
    if (generatedError == "") {
      setLoad({
        ...load,
        saveRoom: true,
      });
      axiosInstance
        .post("ModalityMaster/SaveRoom", {
          RoomName: payloadRoom?.RoomName?.trim(),
          DepartmentId: payloadRoom?.RoomType,
        })
        .then((res) => {
          setLoad({
            ...load,
            saveRoom: false,
          });
          toast?.success(res?.data?.message);
          setPayloadRoom({
            RoomName: "",
            RoomType: "",
          });
          BindRoomList(setRoom);
          setErr("");
        })
        .catch((err) => {
          setLoad({
            ...load,
            saveRoom: false,
          });
          toast.error(err?.response?.data?.message ?? "Something Went Wrong");
        });
    } else setErr(generatedError);
  };
  const handleSaveRoomMap = () => {
    const generatedError = RoomMapValidation(payloadMap);
    if (generatedError == "") {
      setLoad({
        ...load,
        saveMap: true,
      });
      axiosInstance
        .post("ModalityMaster/SaveMapping", payloadMap)
        .then((res) => {
          setLoad({
            ...load,
            saveMap: false,
          });
          toast?.success(res?.data?.message);
          setPayloadMap({
            RoomId: "",
            GroupId: "",
          });
          setError("");
          handleSearch();
        })
        .catch((err) => {
          setLoad({
            ...load,
            saveMap: false,
          });
          toast.error(err?.response?.data?.message ?? "Something Went Wrong");
        });
    } else setError(generatedError);
  };
  const handleSearch = () => {
    axiosInstance
      .get("ModalityMaster/LoadMapping")
      .then((res) => {
        setTableData(res?.data?.message);
      })
      .catch((err) => {
        setTableData([]);
      });
  };
  const handleRemove = (ele) => {
    axiosInstance
      .post("ModalityMaster/RemoveMapping", {
        GroupId: ele?.groupId,
        RoomId: ele?.roomId,
      })
      .then((res) => {
        toast?.success(res?.data?.message);
        handleSearch();
      })
      .catch((err) => {
        console.log(err?.response?.data?.message ?? "Something Went Wrong");
      });
  };
  useEffect(() => {
    bindDepartment(setRoomType);
    BindRoomList(setRoom);
    BindGroupToken(setGroupToken);
    handleSearch();
  }, []);
  return (
    <>
      <Heading
        isBreadcrumb={true}
        name={t("Sample Collection/Radiology Acceptance Room Master")}
      />
      <Accordion title={t("Create Room")} defaultValue={true}>
        <div className="row px-2 mt-2 mb-1">
          <div className="col-md-2">
            <Input
              id="Room Name"
              lable="Room Name"
              placeholder=" "
              type="text"
              name="RoomName"
              value={payloadRoom?.RoomName}
              onChange={handleChange}
              className="required-fields"
            />
            {payloadRoom?.RoomName.trim() === "" && (
              <span className="error-message">{err?.RoomName}</span>
            )}
          </div>

          <div className="col-sm-12 col-md-2">
            <SelectBox
              lable="Department"
              id="Department"
              options={[{ label: "Select Room Type", value: "" }, ...roomType]}
              selectedValue={payloadRoom?.RoomType}
              name="RoomType"
              onChange={handleChange}
              className="required-fields"
            />

            {payloadRoom?.RoomType === "" && (
              <span className="error-message">{err?.RoomType}</span>
            )}
          </div>
          <div className="col-md-1">
            {load?.saveRoom ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                onClick={handleSaveRoom}
              >
                {t("Save")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Map Room-Token")} defaultValue={true}>
        <div className="row px-2 mt-2 mb-1">
          <div className="col-md-2">
            <SelectBox
              lable="Room Name"
              id="Room Name"
              options={[{ label: "Select Room Name", value: "" }, ...room]}
              selectedValue={payloadMap?.RoomId}
              name="RoomId"
              onChange={handleChangeMap}
              className="required-fields"
            />

            {payloadMap?.RoomId.trim() === "" && (
              <span className="error-message">{error?.RoomId}</span>
            )}
          </div>

          <div className="col-sm-12 col-md-2">
            <SelectBox
              lable="Token Group"
              id="Token Group"
              options={[
                { label: "Select Group Token", value: "" },
                ...groupToken,
              ]}
              selectedValue={payloadMap?.GroupId}
              name="GroupId"
              onChange={handleChangeMap}
              className="required-fields"
            />

            {payloadMap?.GroupId === "" && (
              <span className="error-message">{error?.GroupId}</span>
            )}
          </div>
          <div className="col-md-1">
            {load?.saveMap ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                onClick={handleSaveRoomMap}
              >
                {t("Save Mapping")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title="Search Detail" defaultValue={true}>
        <>
          <Tables>
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-center">{t("#")}</th>
                <th className="text-center">{t("Room Name")}</th>
                <th className="text-center">{t("Group Name")}</th>
                <th className="text-center">{t("Role Name")}</th>
                <th className="text-center">{t("Remove")}</th>
              </tr>
            </thead>
            {tableData?.length > 0 && (
              <tbody>
                {tableData?.map((ele, index) => (
                  <>
                    <tr>
                      <td data-title="#" className="text-center">
                        {index + 1}
                      </td>
                      <td data-title="Room Name" className="text-center">
                        {ele?.roomName}
                      </td>
                      <td data-title="Group Name" className="text-center">
                        {ele?.groupName}
                      </td>
                      <td data-title="Role Name" className="text-center">
                        {ele?.rolename}
                      </td>
                      <td data-title="Remove" className="text-center">
                        <button
                          className="btn btn-danger btn-sm w-5"
                          onClick={() => handleRemove(ele)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            )}
          </Tables>
        </>
      </Accordion>
    </>
  );
};

export default ScRoomMaster;
