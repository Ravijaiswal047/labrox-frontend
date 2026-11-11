import React, { useState } from 'react';
import Accordion from '../../components/UI/Accordion';
import { dateConfig, getRangeClass } from '../../utils/helpers';
import UploadFile from '../utils/UploadFileModal/UploadFile';
import TemplateMasterModal from '../utils/TemplateMasterModal';
import ResultEntryEditModal from '../utils/ResultEntryEditModal';
import PatientDetailModal from '../utils/PatientDetailModal';
import ResultEntryTableCustom from './ResultEntryTableCustom';
import Tooltip from '../../components/formComponent/Tooltip';
import Tables from '../../components/UI/customTable';
import ReactSelect from '../../components/formComponent/ReactSelect';
import Loading from '../../components/loader/Loading';
import Input from '../../components/formComponent/Input';
import { SelectBox } from '../../components/formComponent/SelectBox';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CustomButton } from '../../components/UI/CustomButton';

const ResultCultureVisit = (
    // {ResultData, ResultTestData, setShow2, setShow3, show2, show3, setShow, show, setShowPH, showPH,
    // handleNotApproveRemark, handleResultSubmit, handleCheckboxRA , handleKeyUpRA, entryShow, mandatoryIDs,bindAllergyType,getEntryData, GetResultEntryCulture,
    // buttonsData,setResultTestData,
    //     setEntryShow,
    //     setEntry,
    //     setInvestigationID,
    //     setEntryPayload,
    //     PrintReportLoading,
    //     setResultData,
    //     setMandatoryIDs,
    //     handleReport,
    //     printHeader,
    //     statusValue,
    //     loading,
    //     reData,
    //     checkDualAuthentication,
    //     doctorAdmin,
    //     entryPayload,
    //     handleDoctorNameRA,
    //     myRefs,
    //     entry,
    //     handleSave,
    //     onArrowNavigate,
    //     removeArrayAtIndex,
    //     handleSensitivity}
) => {
    
      const { t } = useTranslation();
    return (
       <>
       <div>Page under process</div>
       
       </>
    );
};

export default ResultCultureVisit;