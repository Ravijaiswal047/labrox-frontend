import makeApiRequest from "../utils/axiosInstance";

export const GetTopVisitorPatients = async (fromDate, toDate) => {
  try {
    const data = await makeApiRequest(
      "CommonController/GetTopVisitorPatients",
      {
        method: "POST",
        data: { fromDate, toDate },
      },
    );
    return data;
  } catch (error) {
    console.error("Error fetching top visitor patients", error);
  }
};

export const GetPatientCenterWiseYearly = async (centreIDs = [], fromDate, toDate) => {
  try {
    const data = await makeApiRequest(
      "CommonController/GetPatientCenterWiseYearly",
      {
        method: "POST",
        data: { centreIDs, fromDate, toDate },
      },
    );
    return data;
  } catch (error) {
    console.error("Error fetching patient center wise yearly", error);
  }
};
