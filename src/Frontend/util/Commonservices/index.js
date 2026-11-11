import moment from "moment/moment";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";

const getS3url = async (id) => {
  if (id && id !== "") {
    try {
      const res = await axiosInstance.post("CommonController/GetFileUrl", {
        Key: id,
      });
      return res?.data?.message;
    } catch (err) {
      console.log(err);
    }
  } else {
    toast.error("No Image found");
  }
};

export const getS3FileData = async (guidNumber, pageName) => {
  let Data = [];
  try {
    const res = await axiosInstance.post("CommonController/GetDocument", {
      Page: pageName,
      Guid: guidNumber,
    });
    Data = res?.data?.message;
  } catch (err) {
    console.log(err);
  }
  const upDatedData = await Promise.all(
    Data.map(async (data) => {
      const fileUrl = await getS3url(data?.awsKey);
      return { ...data, fileUrl };
    }),
  );
  return upDatedData;
};
const S4 = () => {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
export const guidNumber = () => {
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

  return guidNumber;
};

export function getGreeting(type) {
  const now = new Date();

  if (type === "date") {
    return moment(now).format("MMM D, yyyy");
  }

  const hours = now.getHours();

  if (type === "greeting") {
    if (hours < 12) {
      return "Good Morning";
    } else if (hours < 18) {
      return "Good Afternoon";
    } else if (hours < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  }

  if (type === "month") {
    const currentMonth = moment(now).format("MMMM");
    const previousMonth1 = moment(now).subtract(1, "months").format("MMMM");
    const previousMonth2 = moment(now).subtract(2, "months").format("MMMM");
    return [currentMonth, previousMonth1, previousMonth2];
  }

  if (type === "day") {
    return moment(now).format("dddd");
  }
}

export const isChecked = (name, state, value, id) => {
  if (id) {
    const data = state?.map((ele) => {
      if (ele?.TestID === id) {
        return ele[name] === value ? true : false;
      } else {
        return ele;
      }
    });
    return data;
  } else {
    const data = state?.map((ele) => {
      return ele[name] == value ? true : false;
    });
    return data;
  }
};

export const getAccessRateType = (state) => {
  axiosInstance
    .get("RateType/getAccessRateType")
    .then((res) => {
      let data = res.data.message;
      let CentreDataValue = data.map((ele) => {
        return {
          value: ele.RateTypeID,
          label: ele.Rate,
        };
      });
      state(CentreDataValue);
    })
    .catch((err) => console.log(err));
};

export const getAccessRateTypeNew = (state) => {
  axiosInstance
    .post("Centre/getRateTypeWithGlobalCentre")
    .then((res) => {
      let data = res.data.message;
      let CentreDataValue = data.map((ele) => {
        return {
          value: ele.RateTypeID,
          label: ele.Rate,
        };
      });
      state(CentreDataValue);
    })
    .catch((err) => console.log(err));
};

export const getBillingCategory = (state) => {
  axiosInstance
    .get("RateList/getBillingCategory")
    .then((res) => {
      let data = res.data.message;
      let val = data.map((ele) => {
        return {
          value: ele?.BillingCategoryID,
          label: ele?.BillingCategory,
        };
      });
      state(val);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const AllowedSpecialChar = (val, allowedSpecialCharacters) => {
  const isValid =
    val === "" ||
    [...val].every(
      (char) =>
        /[a-zA-Z0-9]/.test(char) || allowedSpecialCharacters.includes(char),
    );
  if (isValid) {
    return val;
  } else {
    return;
  }
};

export const PreventSpecialCharacterandNumber = (value) => {
  const reg = /[^a-zA-Z ]/g;
  if (!reg.test(value)) {
    return true;
  } else {
    return false;
  }
};


export const PreventSpecialCharacter = (value) => {
  const reg = /[^a-zA-Z0-9 ]/g;
  return !reg.test(value);
};
