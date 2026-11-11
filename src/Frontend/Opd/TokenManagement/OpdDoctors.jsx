import React, { use, useEffect, useState } from 'react'
import Accordion from '../../../components/UI/Accordion'
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../../../utils/axiosInstance';
import Input from '../../../components/formComponent/Input';
import Loading from '../../../components/loader/Loading';
import Heading from '../../../components/UI/Heading';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const OpdDoctors = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const [load, setLoad] = useState(false);
    const [doctorList, setDoctorList] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const GetDoctorList = () => {
        setLoad(true);
        axiosInstance
            .get(`OPDConsultant/GetDoctorListByDepID`)
            .then((res) => {
                if (res?.data?.success) {
                    setDoctorList(res.data.message || []);
                    setLoad(false);
                } else {
                    setDoctorList([]); setLoad(false);
                }
            })
            .catch(() => setDoctorList([]), setLoad(false));
    };

    useEffect(() => {
        GetDoctorList();
    }, []);



    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);

        if (checked) {
            setSelectedDoctors(filteredDoctors.map((d) => d.DoctorID));
        } else {
            setSelectedDoctors([]);
        }
    };

    const handleDoctorChange = (id) => {
        setSelectedDoctors((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const filteredDoctors = doctorList.filter((d) =>
        d?.DoctorName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDisplay = () => {

        if (!selectedDoctors.length) {
            toast.warn("Please select at least one doctor");
            return;
        }
        const ids = selectedDoctors.join(",");
        navigate("/token-queue", {
            state: { doctorId: ids },
        });
    };



    return (
        <Accordion
            name={t("Doctor Wise Token Display")}
            defaultValue={true}
            isBreadcrumb={true}
        >

            {/* Search */}
            <div className="row px-2 mt-2 mb-1">
                <div className="col-sm-2">
                    <Input
                        type="text"
                        lable={t("Search Doctor")}
                        placeholder=""
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                </div>
                <div className="col-sm-2">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="selectAll"
                            checked={selectAll}
                            onChange={handleSelectAll}
                        />
                        <label className="form-check-label" style={{ fontWeight: "bold" }} htmlFor="selectAll">
                            {t("Select All Doctors")}
                        </label>
                    </div>
                </div>
            </div>

            <Heading title={t("Doctor List")} />
            <div className="row col-12"
                style={{ maxHeight: "200px", overflowY: "auto" }}
            >
                {filteredDoctors.map((doc) => (
                    <div className="col-md-3 col-sm-6 mb-2" key={doc.DoctorID}>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`doc_${doc.DoctorID}`}
                                checked={selectedDoctors.includes(doc.DoctorID)}
                                onChange={() => handleDoctorChange(doc.DoctorID)}
                            />
                            <label
                                className="form-check-label text-primary"
                                htmlFor={`doc_${doc.DoctorID}`}
                            >
                                {doc.DoctorName}
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="col-sm-1 p-2">
                {load ? (
                    <Loading />
                ) : (
                    <button
                        className="btn btn-success btn-sm btn-block"
                        onClick={handleDisplay}
                    >
                        {t("Display")}
                    </button>
                )}

            </div>


        </Accordion>
    );
};

export default OpdDoctors;