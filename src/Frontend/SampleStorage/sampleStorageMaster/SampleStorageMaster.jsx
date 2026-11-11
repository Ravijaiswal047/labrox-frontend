import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import TrayMaster from "./TrayMaster";
import DeviceMaster from "./DeviceMaster";
import TrackMaster from "./TrackMaster";
import "./SampleStorageMaster.css";
import Heading from "../../../components/UI/Heading";
import { ViewMenu } from "../../../components/SvgIcons";
import SeeMore from "../frameMenu/SeeMore";

const SampleStorageMaster = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const seeMoreData = [
    {
      name: "Tray Master",
      component: <TrayMaster setShowMore={setShowMore} />,
      url: "/SampleStorageTrayMaster",
    },
    {
      name: "Device Master",
      component: <DeviceMaster setShowMore={setShowMore} />,
      url: "/SampleStorageDeviceMaster",
    },
    {
      name: "Storage Type Master",
      component: <TrackMaster setShowMore={setShowMore} />,
      url: "/StorageTypeMaster",
    },
  ];

  const activeComponent = useMemo(() => {
    const match = seeMoreData.find((item) => item.url === location.pathname);
    return match ? match.component : seeMoreData[0].component;
  }, [location.pathname]);

  return (
    <>
      <Heading
        name="Sample Storage Master"
        isBreadcrumb={true}
        secondTitle={
          <label onClick={() => setShowMore((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />

      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}

      <div className="mt-2">{activeComponent}</div>
    </>
  );
};

export default SampleStorageMaster;
