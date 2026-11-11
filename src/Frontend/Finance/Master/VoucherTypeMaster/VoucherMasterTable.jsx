import React from "react";
import Tables from "../../../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import HisTable from "../../../../components/UI/customTable/HisTable";

const VoucherMasterTable = ({bindVoucherData,onEdit,handleDeactive}) => {
 const [t] = useTranslation();

  const thead = [
    { name: t("S.No."), width: "1%" },
    { name: t("Code"), width: "1%" },
    { name: t("Voucher Type"), width: "1%" },
    { name: t("Voucher Name"), width: "10%" },
    { name: t("Full Name"), width: "10%" },
    { name: t("Approval Level (Max)"), width: "10%" },
    // { name: t("Auto Verify HIS Data"), width: "10%" },
    // { name: t("Auto Auth HIS Data"), width: "10%" },
    { name: t("Created By"), width: "10%" },
    { name: t("Created Date"), width: "10%" },
    { name: t("Status"), width: "1%" },
    { name: t("Edit"), width: "1%" },
    { name: t("Action"), width: "1%" },
  ];
  

  const tbody =  bindVoucherData.map((val,index)=>(
    {
      "S.No.": index+1,
      Code: val?.VoucherCode,
      VoucherType: val?.TransactionType,
      VoucherName: val?.VoucherName,
      FullName: val?.VoucherFullName,
      // FullName: val?.VoucherFullName,
      MaxApprovalLevel: val?.MaxApprovalLevelName,
      // AutoVerifyHISData: val?.IsAutoVerifyHISData,
      // AutoAuthHISData: val?.IsAutoAuthByHISData,
      CreatedBy: val?.EntryBy,
      CreatedDate: val?.EntryDate,
      Status: val?.Active,
      Edit:<span> <i className="fa fa-edit" onClick={()=>onEdit(val)}></i></span>,
      Action: <span style={{fontWeight:"500", color:"blue"}} onClick={()=>handleDeactive(val)}>{val?.EAction}</span>,
    }
))
  return (
    <>
      <HisTable thead={thead} tbody={[...tbody]} />
    </>
  );
};

export default VoucherMasterTable;
