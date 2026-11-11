import {
  LayoutDashboard,
  Wrench,
  MessageSquare,
  ClipboardList,
  Wallet,
  Printer,
  Stethoscope,
  ShieldCheck,
  BedDouble,
  Receipt,
  Users,
  FlaskConical,
  FileText,
  Ticket,
  IdCard,
  Home,
  Banknote,
  Bike,
  Ambulance,
  Star,
  Newspaper,
  UserCog,
  MoveHorizontal,
  Settings,
  Target,
} from "lucide-react";

const keywordIconMap = {
  Favourite: "bi-star-fill",
  Emergency: "fa fa-ambulance",
  Camp: "fa fa-ambulance",
  Report: "fa fa-newspaper",
  Collection: "fa fa-newspaper",
  Combine: "fa fa-newspaper",
  Membership: "pi pi-id-card",
  Doc: "fa fa-user-md",
};

const iconMap = {
  Favourite: "bi-star-fill",
  Laboratory: "fa fa-flask",
  Reports: "fa fa-hospital-o",
  Administrator: "fa fa-user",
  Master: "fa fa-wrench",
  Invoicing: "pi pi-wallet",
  DocAccount: "fa fa-user-md",
  CouponMaster: "pi pi-ticket",
  MembershipMaster: "pi pi-id-card",
  CustomerCare: "pi pi-home",
  "Online Payment": "pi pi-money-bill",
  Radiology: "fa fa-solid fa-people-arrows",
  Tools: "fa fa-solid fa-cog",
  Logistic: "fa fa-bicycle",
};

// Returns a FontAwesome/PrimeIcons class string, matching Classic's existing convention.
export const getMenuIcon = (menuName = "") => {
  for (const keyword in keywordIconMap) {
    if (menuName.includes(keyword)) {
      return keywordIconMap[keyword];
    }
  }
  return iconMap[menuName] || "pi pi-bullseye";
};

const keywordLucideMap = [
  [/Favourite/i, Star],
  [/Emergency|Camp|Ambulance/i, Ambulance],
  [/Report|Collection|Combine/i, Newspaper],
  [/Membership/i, IdCard],
  [/Doc/i, Stethoscope],
];

const lucideMap = {
  Dashboard: LayoutDashboard,
  Laboratory: FlaskConical,
  Reports: FileText,
  Administrator: UserCog,
  Master: Wrench,
  Invoicing: Wallet,
  DocAccount: Stethoscope,
  CouponMaster: Ticket,
  MembershipMaster: IdCard,
  CustomerCare: Home,
  "Online Payment": Banknote,
  Radiology: MoveHorizontal,
  Tools: Settings,
  Logistic: Bike,
  Registration: ClipboardList,
  "Advance/Settlement": Receipt,
  Reprint: Printer,
  OPD: Users,
  Approval: ShieldCheck,
  IPD: BedDouble,
  "Estimate Billing": Receipt,
  FEEDBACK: MessageSquare,
};

// Returns a lucide-react icon component, used by NextGen's icon rail.
export const getMenuLucideIcon = (menuName = "") => {
  for (const [pattern, Icon] of keywordLucideMap) {
    if (pattern.test(menuName)) return Icon;
  }
  return lucideMap[menuName] || Target;
};
