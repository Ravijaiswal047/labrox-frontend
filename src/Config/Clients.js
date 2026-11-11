import oliveLogo from '../assets/image/oliv-logo.png'
import ldplLogo from '../assets/image/newLogin_logo.png';
import apcLogo from '../assets/image/aarogya-logo.png';
import nplLogo from '../assets/image/nplbg.png';
import labroxLogo from '../assets/image/labrox_logo.png';
import pacificLogo from '../assets/image/pacific_logo.png'
import pathcareLogo from '../assets/image/pathcare.png'
import nanjappaLogo from '../assets/image/nanjappa.jpg'
import karauliLogo from '../assets/image/karauli_logo.webp'
import healthGrowLogo from '../assets/image/healthgrow_new_logo.jpeg'
import uatFavicon from '../assets/image/image copy.png'

const Clients = {
  "olive.itdoseinfo.com": {
    name: "Oliv",
    themeColor: "#e91e63",
    title: "LabRox | Olive",
    loginComponent: "OliveLoginPage",
    favicon: "",
    logo:oliveLogo,
  },
  "olive-uat.itdoseinfo.com": {
    name: "Oliv",
    themeColor: "#e91e63",
    title: "LabRox | Olive",
    loginComponent: "OliveLoginPage",
    favicon: "",
    logo:oliveLogo,
  },
  "lis9.ldpldiagnostics.in": {
    name: "LDPL Diahnostics",
    themeColor: "#0033ff",
    title: "LabRox | LDPL",
    loginComponent: "LoginPage",
    favicon: "/favicons/favicon_ldpl.ico",
    logo:ldplLogo,
  },
  "apc.itdoseinfo.com": {
    name: "APC",
    themeColor: "#4caf50",
    title: "LabRox | APC",
    loginComponent: "ApcLoginPage",
    favicon: "/favicons/favicon_arogya.png",
    logo:apcLogo,
  },
  "npl.itdoseinfo.com": {
    name: "NPL",
    themeColor: "#7f91df",
    title: "LabRox | NPL",
    loginComponent: "NplLoginPage",
    favicon: "/favicons/npl_favicon.png",
    logo:nplLogo,
  },
  "lis9.nationalpathlabs.com": {
    name: "NPL",
    themeColor: "#7f91df",
    title: "LabRox | NPL",
    loginComponent: "NplLoginPage",
    favicon: "/favicons/npl_favicon.png",
    logo:nplLogo,
  },
  "uat-v9.itdoseinfo.com:8088": {
    name: "LabRox",
    themeColor: "#7f91df",
    title: "LabRox | New Gen Software",
    loginComponent: "ItDoseInfoLogin",
    favicon: "/favicon.ico",
    logo: labroxLogo,
  },
  "prod-v9.itdoseinfo.com:8088": {
    name: "LabRox",
    themeColor: "#7f91df",
    title: "LabRox | New Gen Software",
    loginComponent: "ItDoseInfoLogin",
    // uatFavicon ("image copy.png") is just a generic globe placeholder,
    // not an actual logo - that's why the browser tab showed no real icon.
    // Use the real itDose logo instead.
    favicon: "/favicon.ico",
    logo: labroxLogo,
  },
  "demov9.itdoseinfo.com:8088": {
    name: "LabRox",
    themeColor: "#7f91df",
    title: "LabRox | New Gen Software",
    loginComponent: "ItDoseInfoLogin",
    favicon: "/favicon.ico",
    logo: labroxLogo,
    // Only this entry gets the green "Production" badge on the login page -
    // same ItDoseInfoLogin component/dashboard as uat-v9, just visually
    // flagged so nobody mistakes this domain for the UAT one.
    envBadge: "Production",
  },
  "pkl.itdoseinfo.com:8088": {
    name: "PathCare Kenya",
    themeColor: "#7f91df",
    title: "LabRox | PathCare Kenya",
    loginComponent: "PathcareLogin",
    favicon: "/favicons/pathcare.png",
    logo:pathcareLogo,
  },
  "lims.pathcarekenya.co.ke": {
    name: "PathCare Kenya",
    themeColor: "#7f91df",
    title: "LabRox | PathCare Kenya",
    loginComponent: "PathcareLogin",
    favicon: "/favicons/pathcare.png",
    logo:pathcareLogo,
  },
  "pacific.itdoseinfo.com": {
    name: "Pacific",
    themeColor: "#7f91df",
    title: "LabRox | Pacific",
    loginComponent: "PacificLogin",
    favicon: "/favicons/pacific_favicon.ico",
    logo:pacificLogo,
  },
  "nhlis.nanjappahealthcare.com": {
    name: "Nanjappa",
    themeColor: "#7f91df",
    title: "LabRox | Nanjappa",
    loginComponent: "NanjappaLogin",
    favicon: "/favicons/nanjappa.ico",
    logo: nanjappaLogo,
  },
  "karauliv9.itdoseinfo.com": {
    name: "Karauli Diagnostics",
    themeColor: "#0fa89f",
    title: "LabRox | Karauli Diagnostics",
    loginComponent: "KarauliLogin",
    favicon: "/favicons/favicon_karauli.png",
    logo: karauliLogo,
  },
  "karauli.itdoseinfo.com:8088": {
    name: "Karauli Diagnostics",
    themeColor: "#0fa89f",
    title: "LabRox | Karauli Diagnostics",
    loginComponent: "KarauliLogin",
    favicon: "/favicons/favicon_karauli.png",
    logo: karauliLogo,
  },
  "healthgrow.itdoseinfo.com": {
    name: "Health Grow Path Lab",
    themeColor: "#16247a",
    title: "LabRox | Health Grow Path Lab",
    loginComponent: "HealthGrowLogin",
    favicon: "/favicons/favicon_healthgrow.png",
    logo: healthGrowLogo,
  },
  "drx.itdoseinfo.com": {
    name: "DrX Labs",
    themeColor: "#e03427",
    title: "LabRox | DrX Labs",
    loginComponent: "DrxLabsLogin",
    // Served straight from public/img (same file the login page itself
    // uses), not an imported asset - no bundler processing needed.
    favicon: "/img/logo-drxlabs.jpg",
  },
  "excult.itdoseinfo.com": {
    name: "Exult Diagnostics",
    themeColor: "#393185",
    title: "LabRox | Exult Diagnostics",
    loginComponent: "ExultLogin",
    favicon: "/img/escult.png",
  },
  "localhost:3000": {
    name: "LabRox",
    themeColor: "#0033ff",
    title: "LabRox | New Gen Software",
    loginComponent: "ItDoseInfoLogin",
    favicon: "/favicon.ico",
    logo: labroxLogo,
  },
  "localhost:8088": {
    name: "LabRox",
    themeColor: "#0033ff",
    title: "LabRox | New Gen Software",
    loginComponent: "ItDoseInfoLogin",
    favicon: "/favicon.ico",
    logo: labroxLogo,
  },
  "localhost": {
    name: "LabRox",
    themeColor: "#0033ff",
    title: "LabRox | New Gen Software",
    loginComponent: "ItDoseInfoLogin",
    favicon: "/favicon.ico",
    logo: labroxLogo,
  },
};

export default Clients;
