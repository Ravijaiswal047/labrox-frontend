import { FaFont, FaCode, FaFileImage, FaBarcode, FaQrcode, FaStamp, FaFileAlt, FaMinus, FaSquare, FaTag, FaTable, FaWallet, FaCalculator } from "react-icons/fa";

// Shared element-type -> icon map, used by both the Palette (chip icons) and the
// Layers list (per-row type icon), so the two stay visually consistent.
export const TYPE_ICONS = {
  label: FaFont,
  html: FaCode,
  image: FaFileImage,
  barcode: FaBarcode,
  qrcode: FaQrcode,
  stamp: FaStamp,
  pageno: FaFileAlt,
  line: FaMinus,
  rect: FaSquare,
  field: FaTag,
  bodytable: FaTable,
  settletable: FaWallet,
  totalsblock: FaCalculator,
};
