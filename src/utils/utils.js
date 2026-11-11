import { toast } from "react-toastify";
import { useLocalStorage } from "./hooks/useLocalStorage";
import oliveLogo from "../assets/image/HDFCLOGO_new.png";
import ldpl_logo from "../assets/image/ldpl_logo.png";
import arogyaLogo from "../assets/image/aarogya-logo.png";
import npl_logo from '../assets/image/npllogo.png';
import labroxLogo from '../assets/image/labrox_logo.png';
import nanjappaLogo from '../assets/image/nanjappa.jpg'
import newLogo from '../assets/image/image copy.png'
import pacificLogo from "../assets/image/pacific_logo.png"
import healthGrowLogo from "../assets/image/healthgrow_new_logo.jpeg"
import karauliLogo from "../assets/image/karauli_logo.webp"


export const notify = (message, type = "success") => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "warn") {
    toast.warn(message);
  } else if (type === "error") {
    toast.error(message);
  }
};

// export function formatIndianNumber(num) {
//   return num.toString().replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
// }

export function formatIndianNumber(num) {
  if (isNaN(num)) return num;

  let [integerPart, decimalPart] = num.toString().split(".");
  integerPart = integerPart.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");

  if (decimalPart === undefined) {
    return integerPart + ".00";
  } else if (decimalPart.length === 1) {
    return integerPart + "." + decimalPart + "0";
  } else {
    return integerPart + "." + decimalPart.slice(0, 2);
  }
}

 export const logoList = {
    1: labroxLogo,
    999: labroxLogo,
    998: labroxLogo,
    987: labroxLogo,
    1001: oliveLogo,
    1002: ldpl_logo,
    1003: arogyaLogo,
    1004: npl_logo,
    1005: pacificLogo,
    1006: nanjappaLogo,
    1008: healthGrowLogo,
    1007: karauliLogo
  };