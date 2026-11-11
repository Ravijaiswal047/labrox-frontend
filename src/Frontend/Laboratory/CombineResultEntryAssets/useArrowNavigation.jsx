const useArrowNavigation = ({
  ReportType,
  ResultData,
  redata,
  machine,
  doctorAdmin,
  GetResultEntry,
  GetResultEntryCulture,
}) => {
  const currentIndex = ResultData[0]?.currentIndex;
  console.log("currentIndex", currentIndex);

  const parentReportHandler = (index) => {
    console.log("index1",index);
    GetResultEntry(
      {
        TestID: redata[index]?.TestID,
        LedgerTransactionID: "",
        DepartmentID: "",
        symbol: "",
        Mobile: redata[index]?.Mobile,
        VisitNo: redata[index]?.VisitNo,
        PEmail: redata[index]?.PEmail,
        MacID: machine[0]?.value ?? "",
        LedgertransactionIDHash:
          redata[index]?.LedgertransactionIDHash,
        isOutSource: redata[index]?.isOutSource,
        index: redata[index]?.index,
        ApprovedBy:
          doctorAdmin?.length === 1
            ? doctorAdmin[0]?.value?.toString()
            : "0",
      },
      index
    );
  };

  const childReportHandler = (index) => {
    GetResultEntryCulture(
      {
        LedgerTransactionID:redata[index]?.LedgertransactionId,
        TestID: redata[index]?.TestID,
        DepartmentID: redata[index]?.DepartmentId,
        VisitNo: redata[index]?.LedgerTransactionNo,
        BarcodeNo: redata[index]?.BarcodeNo,
      },
      index,
      false
    );
  };

  // 🧠 Strategy map (THIS is the magic)
  const reportTypeHandlers = {
    "1": parentReportHandler,
    "2": parentReportHandler,
    "22": childReportHandler,
    // future:
    // "42": someOtherHandler
  };

  const handleArrowNavigation = (direction) => {
    if (currentIndex == null) return;

    const dataLength = redata?.length;
    let nextIndex =
      direction === "prev"
        ? currentIndex - 1
        : currentIndex + 1;

    while (nextIndex >= 0 && nextIndex < dataLength) {

      const nextReportType = redata[nextIndex]?.ReportType;
      const handler = reportTypeHandlers[nextReportType];

      if (handler) {
        handler(nextIndex);
        return;
      }

      // ⏭ Skip unsupported ReportType
      nextIndex =
        direction === "prev"
          ? nextIndex - 1
          : nextIndex + 1;
    }

    console.warn("No valid visit found in this direction");
  };

  return { handleArrowNavigation };
};

export default useArrowNavigation;