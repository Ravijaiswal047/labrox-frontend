import React, { useState } from "react";
import axios from "axios";

const AgreementPopup = ({
  isPopupOpen,
  closeAgreeDialog,
  AgreeButtonCheck,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);
  console.log(isPopupOpen);
  const handleAgree = () => {
    if (isAgreed) {
      UserAuthroizedApproval();
    } else {
      alert("Please accept the terms and conditions to proceed.");
    }
  };

  const UserAuthroizedApproval = () => {
    axios
      .post("/api/v1/Users/UserAuthorizedApproval", {
        CompanyId: isPopupOpen?.Id?.user?.CompanyID?.toString(),
      })
      .then((res) => {
        AgreeButtonCheck(isPopupOpen?.Id, true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const htmlContent = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
    
      <style type="text/css">
        * {
          margin: 0;
          padding: 0;
          text-indent: 0; 
        font-size: 15px !important;
        margin-Right:15px !important;
        word-wrap: "break-word";
        white-space: "normal";
        }
        h1 {
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: bold;
          text-decoration: none;
          font-size: 10pt;
        }
        .p,
        p {
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
          margin: 0pt;
        }
        .s4 {
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        li {
          display: block;
        }
        #l1 {
          padding-left: 0pt;
          counter-reset: c1 1;
        }
        #l1 > li > *:first-child:before {
          counter-increment: c1;
          content: counter(c1, decimal) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l1 > li:first-child > *:first-child:before {
          counter-increment: c1 0;
        }
        #l2 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l2 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l2 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l3 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l3 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l3 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l4 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l4 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l4 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l5 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l5 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l5 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l6 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l6 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l6 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l7 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l7 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l7 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l8 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l8 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l8 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l9 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l9 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l9 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l10 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l10 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l10 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        #l11 {
          padding-left: 0pt;
          counter-reset: c2 1;
        }
        #l11 > li > *:first-child:before {
          counter-increment: c2;
          content: counter(c2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l11 > li:first-child > *:first-child:before {
          counter-increment: c2 0;
        }
        li {
          display: block;
        }
        #l12 {
          padding-left: 0pt;
          counter-reset: d1 1;
        }
        #l12 > li > *:first-child:before {
          counter-increment: d1;
          content: counter(d1, decimal) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l12 > li:first-child > *:first-child:before {
          counter-increment: d1 0;
        }
        #l13 {
          padding-left: 0pt;
          counter-reset: d2 1;
        }
        #l13 > li > *:first-child:before {
          counter-increment: d2;
          content: counter(d2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l13 > li:first-child > *:first-child:before {
          counter-increment: d2 0;
        }
        li {
          display: block;
        }
        #l14 {
          padding-left: 0pt;
          counter-reset: e1 1;
        }
        #l14 > li > *:first-child:before {
          counter-increment: e1;
          content: counter(e1, decimal) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l14 > li:first-child > *:first-child:before {
          counter-increment: e1 0;
        }
        #l15 {
          padding-left: 0pt;
          counter-reset: e2 1;
        }
        #l15 > li > *:first-child:before {
          counter-increment: e2;
          content: counter(e2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l15 > li:first-child > *:first-child:before {
          counter-increment: e2 0;
        }
        li {
          display: block;
        }
        #l16 {
          padding-left: 0pt;
        }
        #l16 > li > *:first-child:before {
          content: " ";
          color: black;
          font-family: Symbol, serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        li {
          display: block;
        }
        #l17 {
          padding-left: 0pt;
          counter-reset: g1 1;
        }
        #l17 > li > *:first-child:before {
          counter-increment: g1;
          content: counter(g1, decimal) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l17 > li:first-child > *:first-child:before {
          counter-increment: g1 0;
        }
        #l18 {
          padding-left: 0pt;
          counter-reset: g2 1;
        }
        #l18 > li > *:first-child:before {
          counter-increment: g2;
          content: counter(g2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l18 > li:first-child > *:first-child:before {
          counter-increment: g2 0;
        }
        #l19 {
          padding-left: 0pt;
          counter-reset: g2 1;
        }
        #l19 > li > *:first-child:before {
          counter-increment: g2;
          content: counter(g2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l19 > li:first-child > *:first-child:before {
          counter-increment: g2 0;
        }
        #l20 {
          padding-left: 0pt;
          counter-reset: g3 1;
        }
        #l20 > li > *:first-child:before {
          counter-increment: g3;
          content: counter(g3, lower-roman) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l20 > li:first-child > *:first-child:before {
          counter-increment: g3 0;
        }
        #l21 {
          padding-left: 0pt;
          counter-reset: g3 1;
        }
        #l21 > li > *:first-child:before {
          counter-increment: g3;
          content: counter(g3, lower-roman) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l21 > li:first-child > *:first-child:before {
          counter-increment: g3 0;
        }
        #l22 {
          padding-left: 0pt;
          counter-reset: h1 1;
        }
        #l22 > li > *:first-child:before {
          counter-increment: h1;
          content: counter(h1, lower-roman) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l22 > li:first-child > *:first-child:before {
          counter-increment: h1 0;
        }
        #l23 {
          padding-left: 0pt;
          counter-reset: i1 1;
        }
        #l23 > li > *:first-child:before {
          counter-increment: i1;
          content: counter(i1, lower-roman) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l23 > li:first-child > *:first-child:before {
          counter-increment: i1 0;
        }
        #l24 {
          padding-left: 0pt;
          counter-reset: g2 1;
        }
        #l24 > li > *:first-child:before {
          counter-increment: g2;
          content: counter(g2, lower-latin) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l24 > li:first-child > *:first-child:before {
          counter-increment: g2 0;
        }
        #l25 {
          padding-left: 0pt;
          counter-reset: g3 1;
        }
        #l25 > li > *:first-child:before {
          counter-increment: g3;
          content: counter(g3, lower-roman) ". ";
          color: black;
          font-family: Calibri, sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        #l25 > li:first-child > *:first-child:before {
          counter-increment: g3 0;
        }
        li {
          display: block;
        }
        #l26 {
          padding-left: 0pt;
        }
        #l26 > li > *:first-child:before {
          content: " ";
          color: black;
          font-family: Symbol, serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 10pt;
        }
        table,
        tbody {
          vertical-align: top;
          overflow: visible;
        }
      </style>
    </head>
    <body>
      <p style="padding-top: 3pt; text-indent: 0pt; text-align: left"><br /></p>
      <h1 style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        Terms &amp; Conditions
      </h1>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 107%;
          text-align: justify;
        "
      >
        Please note that other significant terms and conditions of the Order Form
        are listed in the Annexure and are considered an essential component of
        the Order Form. The customer is required to sign the final Order Form. For
        a detailed description of the services, please refer to our website or the
        annexure attached to the Order Form.
      </p>
      <h1
        style="
          padding-top: 8pt;
          padding-left: 2pt;
          text-indent: 0pt;
          text-align: center;
        "
      >
        Other Important Terms and conditions
      </h1>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        <u><b>Governing Documents:</b></u
        ><b> </b>Customer hereby agrees that the items included in this Order Form
        are subject to the terms and conditions of the e- LABpro SaaS Services
        Terms and Conditions available and posted on
        <u
          ><i><b>e-LABpro SaaS Services – T&amp;C</b></i></u
        ><i></i>read with
        <u
          ><i><b>LabRox Data Processing Terms &amp;</b></i></u
        ><i></i
        ><u
          ><i><b>Conditions</b></i></u
        ><i></i>and
        <u
          ><i><b>LabRox SLA and Support Services</b></i></u
        >. The term of this document is final with respect of services provided
        and supersedes any other document including a purchase order or any other
        documents issued by Customer.
      </p>
      <p style="text-indent: 0pt; text-align: left" />
      <h1
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        SLA and Support Services:
        <span class="p"
          >SLA and Support Services shall be as specified in Exhibit A of the
          e-LABpro SaaS Services Terms and Conditions signed between LabRox and
          the Customer. Initial Contract Period: Services starts from
          ‘Subscription Start Date’ as mentioned above. The same is calculated
          based on Order Form signing date, Service provisioning date and agreed
          timelines for the onboarding process. Service provisioning date is the
          date mutually agreed between parties to set up onboarding kick off
          call/discussion and provisioning access to the system. Customers may
          choose to cancel the contract before the project initiation date from
          Order Form signing date for reasonable causes. On such cancellation,
          complete advance will be refunded. Otherwise, the contract is
          non-cancellable for the initial contract period from the Order Form
          signing date. Subscription Start Date will not be extended under any
          conditions, including but not limited to, for any reasons beyond the
          control of LabRox, such as Infrastructure not being ready at Customer’s
          end (machines/staff/license to operate) for deployment, not able to
          provide dedicated SPOC or unreasonable delay in responding to data
          requests or any customization not specifically agreed upon as part of
          this Order Form. 30 days of clear advance notice is required for
          termination of contract after non-cancellable contract period.</span
        >
      </h1>
      <h1
        style="
          padding-top: 7pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        Renewals:
        <span class="p"
          >The items ordered in this Order Form shall automatically renew at the
          end of each term, for a period of another 1 (one) year, without the need
          for additional paperwork, unless either party notifies the other party
          in writing of non-renewal at least sixty (60) days prior to the renewal
          date. The renewal period(s) will be the same as SaaS Services contract
          Term. Unless mutually agreed otherwise, at the end of SaaS Services
          Initial Term. LabRox may increase the fees for each renewal period by
          providing notice of the fee increase (email sufficient) at least thirty
          (30) days prior to the renewal date, such that the fee is subject to
          increase by LabRox of an amount not exceeding 10% of the fee for the
          prior term.</span
        >
      </h1>
      <h1
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        Customer Onboarding:
        <span class="p"
          >Customer agrees to provide required information in Customer Onboarding
          Form to set up onboarding kick off call with Project/Account Manager.
          It’s our endeavor that customers start using our system as soon as
          possible. Information provided in the onboarding form is relied upon for
          provisioning of SaaS Services. Customer information as mentioned above
          in Order Form is used for tax/invoicing purposes and believed to be
          correct and compliant with applicable laws. A dedicated Account/Project
          manager will be assigned on or closer to the Service Provisioning date
          and customers will be informed accordingly. Efforts to provide
          incremental implementation services beyond agreed onboarding
          timelines/scope may be treated as additional service requests and
          charged separately, based on mutual agreement. Onboarding/Deployment
          process starts only after advance amount is released by the customer.
          Implementation/Deployment process is generally carried out online by our
          team of onboarding experts, unless otherwise specifically agreed.
          Onboarding/deployment/implementation fee is payable 100% upfront, on
          signing of the order form and before Service Provisioning date mentioned
          above.</span
        >
      </h1>
      <h1
        style="
          padding-top: 7pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        Payment Terms:
        <span class="p"
          >The access to and continuation of SaaS services are subject to timely
          payment for due invoices. Delay beyond 15 (fifteen) days may result in
          suspension of account. Access can be revived by paying all outstanding
          dues. At the end of the SaaS Services Initial contract period (if not
          renewed), Customer’s right to access and use the items purchased in this
          Order Form shall terminate. Amounts not paid when due shall be subject
          to interest at one and one-half percent (1.5%) per month or, if less,
          the maximum rate of interest allowed by law, calculated from the
          respective invoice date. All old outstanding dues towards recurring
          services shall be cleared before reactivation of access in case the
          account is revived after discontinuation of services. Please note SaaS
          services are billed on a monthly subscription basis and not daily usage
          basis and pro- rata adjustment is not permitted in case services are
          canceled during the month.</span
        >
      </h1>
      <h1
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        Travel Reimbursement Towards Onboarding:
        <span class="p"
          >On-field deployment will be charged at an agreed rate. Expenses
          incurred towards travel, food, stay and conveyance
          allowance/reimbursements in connection with onsite visit at Customer
          location will be borne by Customer. The Customer will pay if any
          additional cost incurred for the hardware (wires, computers, cables
          etc.). Upsell/Additional features/add-on purchases: Additional
          features/add-on sales are treated as independent contracts and a
          separate Order form would be executed for commercial purposes. Billing
          needs to be realigned with original /primary contract’s billing cycle.
          Pro-rata invoice will be raised for services provided from date of
          provisioning of additional features/add-ons till next billing date as
          per original/primary contract. Any additional SMS will be charged as per
          operator agreement.</span
        >
      </h1>
      <p
        style="
          padding-top: 7pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 107%;
          text-align: justify;
        "
      >
        By signing this order form, you acknowledge your acceptance of all the
        terms and conditions outlined in the document, as well as the
        comprehensive version available on a provided weblink within the same
        document.
      </p>
      <p style="padding-top: 3pt; text-indent: 0pt; text-align: left"><br /></p>
      <h1 style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        Terms &amp; Conditions for LabRox SaaS Services
      </h1>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 107%;
          text-align: justify;
        "
      >
        These Terms &amp; Conditions (&quot;Services Terms&quot;) govern the
        services (&quot;Services&quot;) provided by LabRox Systems
        (&quot;LabRox&quot;) to its Indian customers (&quot;Customer&quot;). These
        Services are specified in the Order Form that references these Services
        Terms (each an &quot;Order Form&quot;). LabRox reserves the right to
        update these Services Terms from time to time. However, if such changes
        have a significant impact on a particular Service, they will not be
        effective until the next renewal date for that Service.
      </p>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 107%;
          text-align: justify;
        "
      >
        The Agreement: The following documents together constitute the agreement
        (&quot;Agreement&quot;) between LabRox and the Customer: i) The Order
        Form, ii) These Services Terms, including all Exhibits, and iii) The
        LabRox Data Processing Terms &amp; Conditions (DPA) available at LabRox
        DPA.
      </p>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          text-align: left;
        "
      >
        In case of any conflict between the above documents, the documents higher
        in the order shall supersede those lower in the order.
      </p>
      <ol id="l1">
        <li data-list-text="1.">
          <p
            style="
              padding-top: 8pt;
              padding-left: 23pt;
              text-indent: -17pt;
              text-align: justify;
            "
          >
            Definitions:
          </p>
          <p style="text-indent: 0pt; text-align: left" />
          <h1
            style="
              padding-top: 8pt;
              padding-left: 9pt;
              text-indent: 0pt;
              text-align: left;
            "
          >
            Downtime:
            <span class="p"
              >Refers to the time when the Service is unavailable, which can be
              categorized as Excused Downtime or Unexcused Downtime.</span
            >
          </h1>
          <h1 style="padding-left: 9pt; text-indent: 0pt; text-align: left">
            Downtime Percentage:
            <span class="p"
              >Equals 100% minus the service availability percentage, with a
              minimum target of 99.5%.</span
            >
          </h1>
          <h1
            style="
              padding-left: 9pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: left;
            "
          >
            Excused Downtime:
            <span class="p"
              >Downtime resulting from factors beyond LabRox&#39;s control, such
              as failures in the internet or the Customer&#39;s network,
              application customizations, or planned or emergency maintenance with
              prior notification.</span
            >
          </h1>
          <h1
            style="
              padding-left: 9pt;
              text-indent: 0pt;
              line-height: 10pt;
              text-align: left;
            "
          >
            Data:
            <span class="p"
              >Refers to the data created, transmitted, loaded, or stored in the
              Service by the Customer and Users.</span
            >
          </h1>
          <h1 style="padding-left: 9pt; text-indent: 0pt; text-align: left">
            Reseller:
            <span class="p"
              >A third-party authorized by LabRox to resell or distribute any
              Services to the Customer.</span
            >
          </h1>
          <h1 style="padding-left: 9pt; text-indent: 0pt; text-align: left">
            Service:
            <span class="p"
              >Refers to the SaaS Services and any other allied services provided
              under this Agreement.</span
            >
          </h1>
          <h1
            style="
              padding-left: 9pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: left;
            "
          >
            SaaS Services:
            <span class="p"
              >LabRox providing SaaS services for Customer&#39;s access to the
              Service through the internet-based platform named
              &#39;LabRox&#39;, &#39;LabRox Patient
              App&#39;, and &#39;LabRox Phlebotomy App&#39;.</span
            >
          </h1>
          <h1
            style="
              padding-left: 9pt;
              text-indent: 0pt;
              line-height: 10pt;
              text-align: left;
            "
          >
            Service Level Agreement (SLA):
            <span class="p"
              >Outlines LabRox&#39;s commitments related to Service availability
              as specified in Exhibit A.</span
            >
          </h1>
          <h1 style="padding-left: 9pt; text-indent: 0pt; text-align: left">
            Service Period:
            <span class="p"
              >The storage consumed by the Data included in the applicable
              Service.</span
            >
          </h1>
          <h1 style="padding-left: 9pt; text-indent: 0pt; text-align: left">
            Unexcused Downtime:
            <span class="p"
              >Downtime that is not categorized as Excused Downtime.</span
            >
          </h1>
          <h1 style="padding-left: 9pt; text-indent: 0pt; text-align: left">
            Users:
            <span class="p"
              >Persons authorized by the Customer to access the Service, such as
              employees, consultants, subcontractors, or business partners.</span
            >
          </h1>
          <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
            <br />
          </p>
        </li>
        <li data-list-text="2.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            Services:
          </p>
          <ol id="l2">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: justify;
                "
              >
                LabRox grants the Customer a non-exclusive right to access the
                Service during the Service Period solely for internal business
                purposes and in accordance with this Agreement. The Customer may
                authorize its wholly owned subsidiaries to exercise these rights
                or perform obligations under this Agreement.
              </p>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -17pt;
                  text-align: justify;
                "
              >
                LabRox will provide support for the Service as described in the
                SLA and Support Services – Terms and Conditions in Exhibit A.
              </p>
            </li>
            <li data-list-text="c.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -17pt;
                  text-align: justify;
                "
              >
                LabRox performs backups of the data in the production system.
              </p>
            </li>
            <li data-list-text="d.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 107%;
                  text-align: justify;
                "
              >
                Specific authorizations govern particular Services, and Customer
                access will be limited to the features and functionality included
                in each Service. Unauthorized access to LabRox software or
                functionality is strictly prohibited.
              </p>
              <p style="text-indent: 0pt; text-align: left"><br /></p>
            </li>
          </ol>
        </li>
        <li data-list-text="3.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: left">
            Availability SLA:
          </p>
          <p
            style="
              padding-top: 8pt;
              padding-left: 16pt;
              text-indent: 0pt;
              text-align: left;
            "
          >
            LabRox shall monitor the Service&#39;s availability 24/7, and the
            availability of production Services will be as specified in Exhibit A.
          </p>
        </li>
        <li data-list-text="4.">
          <p
            style="
              padding-top: 8pt;
              padding-left: 23pt;
              text-indent: -17pt;
              text-align: left;
            "
          >
            Usage Restrictions:
          </p>
          <ol id="l3">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 30pt;
                  text-indent: -14pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                Customer may access and use the Services only within the
                authorizations acquired in accordance with this Agreement. Usage
                beyond these authorizations will be treated as overage.
              </p>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 30pt;
                  text-indent: -14pt;
                  line-height: 10pt;
                  text-align: left;
                "
              >
                Access credentials to the Services may not be shared by multiple
                individuals.
              </p>
            </li>
            <li data-list-text="c.">
              <p
                style="
                  padding-left: 30pt;
                  text-indent: -14pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                The Services may not be used for unlawful, obscene, offensive, or
                fraudulent content or activity. LabRox may suspend access if any
                violation occurs, pending resolution.
              </p>
            </li>
            <li data-list-text="d.">
              <p
                style="
                  padding-left: 30pt;
                  text-indent: -14pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                Customer shall not permit third parties, except Users, to use the
                Services for third-party training, software implementation,
                consulting services, or commercial time-sharing. Customer shall
                not copy, download, or reproduce the Service or any part thereof.
              </p>
              <p style="text-indent: 0pt; text-align: left"><br /></p>
            </li>
          </ol>
        </li>
        <li data-list-text="5.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: left">
            Data Center / Security: a.
          </p>
          <ol id="l4">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                LabRox implements industry-standard measures to protect the
                Services against unauthorized physical access, fire, power,
                temperature, humidity, and other physical threats.
              </p>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                LabRox maintains technical and organizational measures to protect
                Data against accidental or unlawful destruction, loss, alteration,
                or unauthorized access. LabRox adheres to ISO 27001:2013, GDPR,
                SOC-2 framework, and is ISO 27001:2013 certified.
              </p>
            </li>
            <li data-list-text="c.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 107%;
                  text-align: left;
                "
              >
                Customer is responsible for privacy and security measures for
                components of the Services it controls, such as user login and
                password security.
              </p>
              <p style="text-indent: 0pt; text-align: left"><br /></p>
            </li>
          </ol>
        </li>
        <li data-list-text="6.">
          <p style="padding-left: 23pt; text-indent: -14pt; text-align: left">
            Fees, Billing, and Payment:
          </p>
          <ol id="l5">
            <li data-list-text="a.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                Customer shall pay the fees specified in the Order Form to LabRox
                (directly or through a Reseller).
              </p>
            </li>
            <li data-list-text="b.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                Usage exceeding purchased authorizations may be charged as
                overage.
              </p>
            </li>
            <li data-list-text="c.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                Taxes, if applicable, shall be charged separately, and withholding
                taxes, if applicable, are the Customer&#39;s responsibility.
              </p>
            </li>
            <li data-list-text="d.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                Overdue amounts may be subject to interest, and LabRox may suspend
                Services if payments are overdue by thirty (30) days or more.
              </p>
              <p style="padding-top: 3pt; text-indent: 0pt; text-align: left">
                <br />
              </p>
            </li>
            <li data-list-text="e.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                No terms in purchase orders or other documents shall modify or
                become part of this Agreement without LabRox&#39;s written
                consent.
              </p>
              <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
                <br />
              </p>
            </li>
          </ol>
        </li>
        <li data-list-text="7.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: left">
            Indemnification:
          </p>
          <ol id="l6">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                LabRox will defend Customer against any action based on a claim
                that the Services infringe third-party patents, copyrights, or
                trademarks and will settle such actions or pay awarded judgments.
                Customer must promptly notify LabRox and cooperate in defense.
              </p>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                Customer will defend and indemnify LabRox against claims arising
                from Customer&#39;s breach of Sections 3 (Services) or 4 (Usage
                Restrictions).
              </p>
              <p style="text-indent: 0pt; text-align: left"><br /></p>
            </li>
          </ol>
        </li>
        <li data-list-text="8.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: left">
            Ownership / Confidentiality / Privacy:
          </p>
          <ol id="l7">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                LabRox retains exclusive ownership of the Service, its
                documentation, and related intellectual property rights. Customer
                shall not reverse engineer, create derivative works, sublicense,
                or disclose confidential information.
              </p>
              <p style="text-indent: 0pt; text-align: left" />
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                Non-public information regarding the Service&#39;s performance is
                confidential, and Customer shall not disclose or use it for any
                purpose other than exercising its rights under this Agreement.
              </p>
            </li>
            <li data-list-text="c.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                LabRox complies with its privacy policy (LabRox Privacy Policy)
                and Data Processing Terms and Conditions (LabRox DPA) for
                processing Personal Information provided by Customer.
              </p>
              <p style="text-indent: 0pt; text-align: left"><br /></p>
            </li>
          </ol>
        </li>
        <li data-list-text="9.">
          <p style="padding-left: 23pt; text-indent: -14pt; text-align: left">
            Data:
          </p>
          <ol id="l8">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                The Data shall not include U.S. Government Classified, Controlled
                Unclassified Information, ITAR, EAR-controlled, or personal credit
                information.
              </p>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                LabRox treats all Data as confidential and uses it to provide,
                monitor, and improve the Services. LabRox may share Data with
                subcontractors bound by confidentiality obligations.
              </p>
            </li>
            <li data-list-text="c.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                Customer is responsible for its privacy and security measures
                related to the Services.
              </p>
              <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
                <br />
              </p>
            </li>
          </ol>
        </li>
        <li data-list-text="10.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: left">
            Term &amp; Termination:
          </p>
          <ol id="l9">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                The initial Services Period and renewals are specified in the
                Order Form. Either party may terminate Services if the other
                breaches this Agreement and fails to remedy the breach within
                thirty (30) days of written notice.
              </p>
            </li>
            <li data-list-text="b.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                If LabRox discontinues a Service during its term, Customer will
                receive a refund for the prepaid fees of the terminated portion.
              </p>
            </li>
            <li data-list-text="c.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                Certain sections shall survive termination or expiration of
                Services.
              </p>
              <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
                <br />
              </p>
            </li>
          </ol>
        </li>
        <li data-list-text="11.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: left">
            Warranty / Disclaimer of Warranty / Limitations of Liability:
          </p>
          <ol id="l10">
            <li data-list-text="a.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                LabRox warrants that the Service will function substantially as
                documented.
              </p>
            </li>
            <li data-list-text="b.">
              <p style="padding-left: 37pt; text-indent: -17pt; text-align: left">
                Except as stated herein, LabRox disclaims all warranties, and its
                liability is limited as specified in the Agreement.
              </p>
              <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
                <br />
              </p>
            </li>
          </ol>
        </li>
        <li data-list-text="12.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            General:
          </p>
          <ol id="l11">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: justify;
                "
              >
                Governing Law and Dispute Resolution: For customers located in
                India, this Agreement is governed by the laws of India, and any
                dispute shall be resolved through arbitration in New Delhi. For
                customers located outside India, the Agreement is governed by the
                laws of India, and arbitration shall take place in Singapore.
              </p>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -17pt;
                  text-align: justify;
                "
              >
                Force Majeure: LabRox is not liable for performance delays or
                failures due to causes beyond its control.
              </p>
            </li>
            <li data-list-text="c.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -17pt;
                  text-align: justify;
                "
              >
                Notices: All notices shall be in writing and delivered to the
                specified addresses.
              </p>
            </li>
            <li data-list-text="d.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: justify;
                "
              >
                Assignment, Waiver, Modifications: Customer may not assign rights
                or obligations under this Agreement without LabRox&#39;s consent.
                No other terms in purchase orders or documents shall modify this
                Agreement.
              </p>
            </li>
            <li data-list-text="e.">
              <p
                style="
                  padding-left: 37pt;
                  text-indent: -18pt;
                  line-height: 107%;
                  text-align: justify;
                "
              >
                Entire Agreement; Severability: This Agreement constitutes the
                entire agreement between the parties and supersedes prior
                discussions and representations.
              </p>
            </li>
          </ol>
        </li>
      </ol>
      <p style="padding-top: 3pt; text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        EXHIBIT A
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        Service Level Agreement (SLA) and Support Services – Terms and Conditions
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p
        style="
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 107%;
          text-align: left;
        "
      >
        This Exhibit A provides the Service Level Agreement (&quot;SLA&quot;) and
        Support Services – Terms and Conditions between LabRox and Customer for
        the provisioning of IT services required for providing SaaS services.
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-left: 9pt; text-indent: 0pt; text-align: left">
        The SLA and Support Services – Terms and Conditions are available at
        <u
          ><i><b>LabRox SLA and Support Services</b></i></u
        >.
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p
        style="
          padding-left: 7pt;
          text-indent: 0pt;
          line-height: 1pt;
          text-align: left;
        "
      />
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p style="text-indent: 0pt; text-align: left" />
      <p style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        EXHIBIT B
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        Contracting Entities of LabRox
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-left: 9pt; text-indent: 0pt; text-align: left">
        Based on the location of the Customer purchasing SaaS Services from
        LabRox, the respective LabRox contracting entity is specified below.
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <table
        style="border-collapse: collapse; margin-left: 102.51pt"
        cellspacing="0"
      >
        <tr style="height: 16pt">
          <td
            style="
              width: 60pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="padding-top: 1pt; text-indent: 0pt; text-align: center"
            >
              Sr. No.
            </p>
          </td>
          <td
            style="
              width: 114pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="
                padding-top: 1pt;
                padding-left: 5pt;
                text-indent: 0pt;
                text-align: left;
              "
            >
              Customer Location
            </p>
          </td>
          <td
            style="
              width: 151pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="
                padding-top: 1pt;
                padding-left: 5pt;
                text-indent: 0pt;
                text-align: left;
              "
            >
              LabRox Contracting Entity
            </p>
          </td>
        </tr>
        <tr style="height: 22pt">
          <td
            style="
              width: 60pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="padding-top: 1pt; text-indent: 0pt; text-align: center"
            >
              1
            </p>
          </td>
          <td
            style="
              width: 114pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="
                padding-top: 1pt;
                padding-left: 9pt;
                text-indent: 0pt;
                text-align: left;
              "
            >
              India
            </p>
          </td>
          <td
            style="
              width: 151pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="
                padding-top: 1pt;
                padding-left: 9pt;
                text-indent: 0pt;
                text-align: left;
              "
            >
              LabRox Systems Pvt. Ltd.
            </p>
          </td>
        </tr>
        <tr style="height: 22pt">
          <td
            style="
              width: 60pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="padding-top: 9pt; text-indent: 0pt; text-align: center"
            >
              2
            </p>
          </td>
          <td
            style="
              width: 114pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="
                padding-top: 9pt;
                padding-left: 5pt;
                text-indent: 0pt;
                text-align: left;
              "
            >
              Rest of the World
            </p>
          </td>
          <td
            style="
              width: 151pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s4"
              style="
                padding-top: 9pt;
                padding-left: 5pt;
                text-indent: 0pt;
                text-align: left;
              "
            >
              LabRox Systems Pvt. Ltd.
            </p>
          </td>
        </tr>
      </table>
      <p style="padding-top: 3pt; text-indent: 0pt; text-align: left"><br /></p>
      <h1 style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        Data Processing Terms &amp; Conditions
      </h1>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 107%;
          text-align: left;
        "
      >
        This document outlines the terms and conditions governing the processing
        of personal data by LabRox Systems (&quot;LabRox&quot;),
        acting as a data processor, on behalf of the data controller, referred to
        as &quot;Customer,&quot; in compliance with the applicable Indian data
        protection laws.
      </p>
      <ol id="l12">
        <li data-list-text="1.">
          <p
            style="
              padding-top: 8pt;
              padding-left: 23pt;
              text-indent: -17pt;
              text-align: justify;
            "
          >
            Appointment:
          </p>
          <p
            style="
              padding-left: 23pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            Customer, being the data controller, hereby appoints LabRox as a data
            processor to process the personal data listed in the Schedule(s)
            (&quot;Data&quot;) for the purposes described in the Schedule(s) or as
            otherwise agreed in writing by the parties (&quot;Permitted
            Purpose&quot;). Both parties shall comply with their respective
            obligations under the applicable Indian data protection laws.
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="2.">
          <p style="padding-left: 23pt; text-indent: -14pt; text-align: justify">
            Definitions:
          </p>
          <p style="padding-left: 23pt; text-indent: 0pt; text-align: justify">
            In these terms and conditions:
          </p>
          <p style="text-indent: 0pt; text-align: left" />
          <ol id="l13">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 41pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: justify;
                "
              >
                &quot;Principal Agreements&quot; refer to any agreement between
                LabRox and Customer under which LabRox provides services or
                licenses to Customer, including but not limited to LabRox SaaS
                Service Terms and Conditions, LabRox Customer Agreement (License
                Agreement), and Services Agreement.
              </p>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 41pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: justify;
                "
              >
                &quot;Controller,&quot; &quot;Processor,&quot; &quot;Data
                Subject,&quot; &quot;Personal Data,&quot; &quot;Personal Data
                Breach,&quot; &quot;Processing&quot; (and &quot;Process&quot;),
                and &quot;Sensitive Personal Data&quot; shall have the meanings
                given in the applicable Indian data protection laws.
              </p>
              <p style="text-indent: 0pt; text-align: left"><br /></p>
            </li>
          </ol>
        </li>
        <li data-list-text="3.">
          <p style="padding-left: 23pt; text-indent: -14pt; text-align: justify">
            Security and Confidentiality:
          </p>
          <p
            style="
              padding-left: 23pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            LabRox shall implement appropriate security measures to protect the
            personal data from unauthorized access, disclosure, alteration,
            destruction, or any other unauthorized use. LabRox shall ensure that
            its personnel authorized to process the personal data maintain strict
            confidentiality.
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="4.">
          <p style="padding-left: 23pt; text-indent: -14pt; text-align: justify">
            Subcontracting:
          </p>
          <p
            style="
              padding-left: 23pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            Customer consents to LabRox engaging third-party sub-processors to
            process the Data for the Permitted Purpose, provided that LabRox
            enters into a written agreement with such sub-processors to ensure
            compliance with the same level of data protection and confidentiality
            obligations as stated herein. LabRox shall remain liable for any
            breach caused by its sub-processors.
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="5.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            Data Subject Rights and Cooperation:
          </p>
          <p
            style="
              padding-left: 23pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            LabRox shall assist Customer, at Customer&#39;s expense, in responding
            to data subject requests under the Indian data protection laws. LabRox
            shall promptly inform Customer of any such requests or complaints
            received directly from data subjects.
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="6.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            Personal Data Breach:
          </p>
          <p
            style="
              padding-left: 23pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            In the event of a personal data breach, LabRox shall promptly inform
            Customer and provide necessary cooperation to handle and notify the
            relevant authorities as required by the Indian data protection laws.
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="7.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            Deletion or Return of Personal Data:
          </p>
          <p
            style="
              padding-left: 23pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            Upon termination or expiry of the Principal Agreement, LabRox shall,
            at Customer&#39;s choice, either delete or return all personal data in
            its possession or control, unless Indian law requires its retention.
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="8.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            Liability:
          </p>
          <p
            style="
              padding-left: 23pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            Each party&#39;s liability to the other in respect of any individual
            claim for breach of contract, negligence, or any other claim arising
            out of the processing of personal data shall be subject to the
            limitations set forth in the Principal Agreement.
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="9.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            Governing Law and Jurisdiction:
          </p>
        </li>
      </ol>
      <p
        style="
          padding-left: 23pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        These terms and conditions, along with the relevant Principal Agreement,
        shall be governed by and construed in accordance with the laws of India.
        Any disputes arising out of or relating to these terms and conditions
        shall be subject to the exclusive jurisdiction of the courts in [insert
        appropriate jurisdiction in India].
      </p>
      <p
        style="
          padding-top: 7pt;
          padding-left: 9pt;
          text-indent: 0pt;
          text-align: left;
        "
      >
        SCHEDULE: Security Measures Description of the technical and
        organizational security measures implemented by LabRox as the processor.
      </p>
      <ol id="l14">
        <li data-list-text="1.">
          <p
            style="
              padding-top: 8pt;
              padding-left: 23pt;
              text-indent: -17pt;
              text-align: left;
            "
          >
            Secure user authentication protocols, including:
          </p>
          <ol id="l15">
            <li data-list-text="a.">
              <p style="padding-left: 44pt; text-indent: -17pt; text-align: left">
                Control user IDs and other identifiers
              </p>
            </li>
            <li data-list-text="b.">
              <p style="padding-left: 44pt; text-indent: -17pt; text-align: left">
                Provide a reasonably secure method of assigning and selecting
                passwords (or use of 2FA)
              </p>
            </li>
            <li data-list-text="c.">
              <p
                style="
                  padding-left: 44pt;
                  text-indent: -18pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                Control data security passwords to ensure that such passwords are
                kept in a location and/or format that does not compromise the
                security of the data they protect
              </p>
            </li>
            <li data-list-text="d.">
              <p style="padding-left: 44pt; text-indent: -17pt; text-align: left">
                Restrict access to records and files containing personal
                information to those who need such information to perform their
                job duties.
              </p>
            </li>
            <li data-list-text="e.">
              <p
                style="
                  padding-left: 44pt;
                  text-indent: -18pt;
                  line-height: 107%;
                  text-align: left;
                "
              >
                Assign unique identifications plus passwords, which are not vendor
                supplied default passwords, to each person with customer access,
                that are reasonably designed to maintain the integrity of the
                security of the access controls.
              </p>
            </li>
          </ol>
        </li>
        <li data-list-text="2.">
          <p
            style="
              padding-left: 23pt;
              text-indent: -18pt;
              line-height: 108%;
              text-align: left;
            "
          >
            Encrypt (to the extent technically feasible) all transmitted records
            and files containing personal information that will travel across
            public networks, and encryption of all data to be transmitted
            wirelessly.
          </p>
        </li>
        <li data-list-text="3.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: left">
            Implement reasonable monitoring of systems for unauthorized use of or
            access to personal information.
          </p>
          <p style="padding-top: 3pt; text-indent: 0pt; text-align: left">
            <br />
          </p>
        </li>
        <li data-list-text="4.">
          <p style="padding-left: 23pt; text-indent: -17pt; text-align: justify">
            Encrypt all personal information stored on laptops or other portable
            devices.
          </p>
        </li>
        <li data-list-text="5.">
          <p
            style="
              padding-left: 23pt;
              text-indent: -18pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            Provide reasonably up-to-date operating system security patches for
            files containing personal information on a system that is connected to
            the Internet, designed to maintain the integrity of the personal
            information.
          </p>
        </li>
        <li data-list-text="6.">
          <p
            style="
              padding-left: 23pt;
              text-indent: -18pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            Provide reasonably up-to-date versions of system security agent
            software, which must include malware protection and reasonably
            up-to-date patches and virus definitions, or a version of such
            software that can still be supported with up-to-date patches and virus
            definitions, and is set to receive the most current security updates
            on a regular basis.
          </p>
        </li>
        <li data-list-text="7.">
          <p
            style="
              padding-left: 23pt;
              text-indent: -17pt;
              line-height: 10pt;
              text-align: justify;
            "
          >
            Educate and train employees on the proper use of the computer security
            system and the importance of personal information security.
          </p>
        </li>
      </ol>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 189%;
          text-align: justify;
        "
      >
        Data Security Certifications applicable to certain LabRox Products or
        Services: Cloud Services/SaaS – ISO 27001(2013). DATA:
      </p>
      <p style="padding-left: 9pt; text-indent: 0pt; text-align: justify">
        Data subjects
      </p>
      <p style="text-indent: 0pt; text-align: left" />
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          text-align: justify;
        "
      >
        The Personal Data relating to the following categories of data subjects:
      </p>
      <ul id="l16">
        <li data-list-text="">
          <p
            style="
              padding-top: 8pt;
              padding-left: 30pt;
              text-indent: -18pt;
              line-height: 108%;
              text-align: justify;
            "
          >
            Individuals who are authorized by Customer to use LabRox products
            and/or access LabRox services being Customer’s employees, consultants,
            subcontractors, suppliers, business partners, and customers.
          </p>
        </li>
        <li data-list-text="">
          <p
            style="
              padding-left: 12pt;
              text-indent: 0pt;
              line-height: 186%;
              text-align: justify;
            "
          >
            Other individuals whose personal data may be uploaded by Customer to
            LabRox services or software. Personal Data Categories
          </p>
        </li>
      </ul>
      <p
        style="
          padding-left: 12pt;
          text-indent: 0pt;
          line-height: 108%;
          text-align: justify;
        "
      >
        Name, Company, organization, business contact details, interactions with
        LabRox’s products and services such as log files and incident reports,
        training records, and data that may be processed by LabRox’s products, and
        other personal data that an individual may share with LabRox. IP
        addresses, cookie data, device identifiers, and similar device-related
        information. Permitted Purpose:
      </p>
      <p
        style="
          padding-top: 8pt;
          padding-left: 12pt;
          text-indent: 0pt;
          line-height: 106%;
          text-align: justify;
        "
      >
        To DELIVER LabRox SOFTWARE &amp; SaaS SERVICES to Customer in accordance
        with the terms of the Principal Agreement and Customer’s instructions.
      </p>
      <p style="padding-top: 3pt; text-indent: 0pt; text-align: left"><br /></p>
      <h1 style="padding-left: 2pt; text-indent: 0pt; text-align: center">
        Service Level Agreement (SLA) and Support Services – Terms and Conditions
      </h1>
      <ol id="l17">
        <li data-list-text="1.">
          <p
            style="
              padding-top: 8pt;
              padding-left: 30pt;
              text-indent: -17pt;
              text-align: left;
            "
          >
            Goals &amp; Objectives
          </p>
          <p
            style="
              padding-left: 30pt;
              text-indent: 0pt;
              line-height: 106%;
              text-align: left;
            "
          >
            The purpose of this agreement is to establish clear and mutually
            agreed-upon elements for providing consistent IT service support and
            delivery to the Customer(s) by LabRox Systems
            (&quot;LabRox&quot;).
          </p>
          <p
            style="
              padding-top: 8pt;
              padding-left: 9pt;
              text-indent: 0pt;
              text-align: left;
            "
          >
            The objectives of this agreement are to:
          </p>
          <ol id="l18">
            <li data-list-text="a.">
              <p
                style="
                  padding-top: 8pt;
                  padding-left: 30pt;
                  text-indent: -17pt;
                  text-align: left;
                "
              >
                Define service ownership, accountability, roles, and
                responsibilities.
              </p>
            </li>
            <li data-list-text="b.">
              <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
                Provide a concise and measurable description of service provision
                to the customer.
              </p>
            </li>
            <li data-list-text="c.">
              <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
                Align expectations of expected service provision with actual
                service support &amp; delivery.
              </p>
              <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
                <br />
              </p>
            </li>
          </ol>
        </li>
        <li data-list-text="2.">
          <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
            SLA – Service Scope The following service parameters are the
            responsibility of LabRox in the ongoing support:
          </p>
          <p style="text-indent: 0pt; text-align: left" />
          <ol id="l19">
            <li data-list-text="a.">
              <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
                Security
              </p>
              <ol id="l20">
                <li data-list-text="i.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -12pt;
                      text-align: left;
                    "
                  >
                    Communication of data security. ii) Storage of data with
                    proper security measures. iii) Security during payment
                    transactions.
                  </p>
                </li>
              </ol>
            </li>
            <li data-list-text="b.">
              <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
                Maintenance &amp; Support
              </p>
              <ol id="l21">
                <li data-list-text="i.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -12pt;
                      text-align: left;
                    "
                  >
                    Monthly maintenance and performance upgrades.
                  </p>
                </li>
                <li data-list-text="ii.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -14pt;
                      text-align: left;
                    "
                  >
                    Monitored chat support.
                  </p>
                </li>
                <li data-list-text="iii.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -16pt;
                      text-align: left;
                    "
                  >
                    Monitored on-call support.
                  </p>
                </li>
                <li data-list-text="iv.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -16pt;
                      text-align: left;
                    "
                  >
                    Remote assistance using Desktop.
                  </p>
                </li>
                <li data-list-text="v.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -14pt;
                      text-align: left;
                    "
                  >
                    Planned or Emergency On-Site Assistance (Extra cost may
                    apply).
                  </p>
                  <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
                    <br />
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li data-list-text="3.">
          <p style="padding-left: 30pt; text-indent: -21pt; text-align: left">
            Customer Requirements
          </p>
          <p style="padding-left: 30pt; text-indent: 0pt; text-align: left">
            The Customer&#39;s responsibilities and requirements in support of
            this agreement include:
          </p>
          <ol id="l22">
            <li data-list-text="i.">
              <p style="padding-left: 44pt; text-indent: -17pt; text-align: left">
                Timely payment of all invoices within 15 days of invoice date.
              </p>
            </li>
            <li data-list-text="ii.">
              <p style="padding-left: 44pt; text-indent: -19pt; text-align: left">
                Reasonable availability of customer representative(s) during the
                resolution of service-related incidents or requests.
              </p>
            </li>
            <li data-list-text="iii.">
              <p
                style="
                  padding-left: 44pt;
                  text-indent: -21pt;
                  line-height: 108%;
                  text-align: left;
                "
              >
                Ensuring data integrity and authenticity of information entered in
                the system, including the responsibility for all reports generated
                and going out of the system.
              </p>
            </li>
          </ol>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
        </li>
        <li data-list-text="4.">
          <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
            LabRox Requirements
          </p>
          <p style="padding-left: 30pt; text-indent: 0pt; text-align: left">
            LabRox responsibilities and requirements in support of this agreement
            include:
          </p>
          <ol id="l23">
            <li data-list-text="i.">
              <p style="padding-left: 44pt; text-indent: -21pt; text-align: left">
                Meeting response times for service-related incidents.
              </p>
            </li>
            <li data-list-text="ii.">
              <p style="padding-left: 44pt; text-indent: -23pt; text-align: left">
                Providing appropriate notification to the Customer for all
                scheduled maintenance.
              </p>
            </li>
          </ol>
          <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
            <br />
          </p>
        </li>
        <li data-list-text="5.">
          <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
            Service Assumptions
          </p>
          <p style="padding-left: 30pt; text-indent: 0pt; text-align: left">
            Any changes to the in-scope services will be communicated and
            documented to all stakeholders.
          </p>
          <p style="padding-top: 1pt; text-indent: 0pt; text-align: left">
            <br />
          </p>
        </li>
        <li data-list-text="6.">
          <p style="padding-left: 30pt; text-indent: -17pt; text-align: left">
            Service Management
          </p>
          <p
            style="
              padding-left: 30pt;
              text-indent: 0pt;
              line-height: 108%;
              text-align: left;
            "
          >
            Effective support of in-scope services is achieved through consistent
            service levels. The following sections provide relevant details on
            service availability and monitoring:
          </p>
          <p style="text-indent: 0pt; text-align: left"><br /></p>
          <ol id="l24">
            <li data-list-text="a.">
              <p
                style="
                  padding-left: 44pt;
                  text-indent: -21pt;
                  text-align: justify;
                "
              >
                Service Availability
              </p>
              <ol id="l25">
                <li data-list-text="i.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -25pt;
                      line-height: 108%;
                      text-align: justify;
                    "
                  >
                    Telephone support available from 9:00 A.M. to 8:00 P.M. Monday
                    – Saturday and on Sunday from 10:00 A.M. to 6:00 P.M.,
                    including public holidays. Calls received out of office hours
                    will be forwarded to a mobile phone with a backup answer phone
                    service and actioned on the next working days.
                  </p>
                </li>
                <li data-list-text="ii.">
                  <p
                    style="
                      padding-left: 44pt;
                      text-indent: -26pt;
                      line-height: 108%;
                      text-align: justify;
                    "
                  >
                    In-app chat support available from 8:30 A.M. to 6:30 P.M.
                    Monday – Saturday and on Sunday from 10:00 A.M. to 6:00 P.M.,
                    including public holidays. Chats received outside of office
                    hours will be collected and actioned on the next working day.
                  </p>
                </li>
              </ol>
            </li>
            <li data-list-text="b.">
              <p
                style="
                  padding-left: 44pt;
                  text-indent: -17pt;
                  text-align: justify;
                "
              >
                Service Request
              </p>
            </li>
          </ol>
        </li>
      </ol>
      <p style="padding-left: 45pt; text-indent: 0pt; text-align: justify">
        LabRox will respond to service-related incidents and/or requests submitted
        by the Customer within the specified time frames:
      </p>
      <ul id="l26">
        <li data-list-text="">
          <p style="padding-left: 80pt; text-indent: -17pt; text-align: left">
            Severity Level 1 (Critical): 6 hours
          </p>
        </li>
        <li data-list-text="">
          <p style="padding-left: 80pt; text-indent: -17pt; text-align: left">
            Severity Level 2 (Significant): 24 hours
          </p>
        </li>
        <li data-list-text="">
          <p style="padding-left: 80pt; text-indent: -17pt; text-align: left">
            Severity Level 3 (Less Significant): 72 hours
          </p>
        </li>
        <li data-list-text="">
          <p style="padding-left: 80pt; text-indent: -17pt; text-align: left">
            Severity Level 4 (Minimal): 7 Business Days
          </p>
        </li>
      </ul>
      <p
        style="
          padding-top: 8pt;
          padding-left: 9pt;
          text-indent: 0pt;
          line-height: 190%;
          text-align: left;
        "
      >
        Remote assistance will be provided within the above timescales based on
        the priority of the support request. In Witness Whereof, the parties have
        executed this Service Level Agreement as of the Effective Date.
      </p>
    </body>
  </html>
  
    `;
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div
          style={styles.content}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        <div style={styles.checkboxContainer}>
          <div>
            <input
              type="checkbox"
              id="agree"
              checked={isAgreed}
              onChange={() => setIsAgreed(!isAgreed)}
            />
            <label htmlFor="agree" style={styles.label}>
              I have read and accept the terms and conditions
            </label>
          </div>
        </div>
        <div style={styles.actions}>
          <button
            style={
              isAgreed
                ? styles.button
                : { ...styles.button, ...styles.buttonDisabled }
            }
            onClick={handleAgree}
            disabled={!isAgreed}
          >
            Confirm
          </button>
          <button style={styles.buttonclose} onClick={closeAgreeDialog}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    // backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    // padding: "8px",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "18px",
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "90vh",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    animation: "slideIn 0.3s ease-out",
    position: "relative",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: "28px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "30px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#333",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: "20px",
  },
  content: {
    maxHeight: "60vh",
    overflowY: "auto",
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#555",
  },
  termsText: {
    margin: "10px 0",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderLeft: "4px solid #007bff",
    fontSize: "14px",
    color: "#333",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "20px",
  },
  label: {
    marginLeft: "8px",
    fontSize: "14px",
    color: "#333",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "3px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
    textAlign: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    color: "black",
    cursor: "not-allowed",
  },
  buttonclose: {
    backgroundColor: "red",
    color: "#fff",
    padding: "3px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
    textAlign: "center",
  },
  "@keyframes slideIn": {
    from: {
      transform: "translateY(-100px)",
      opacity: 0,
    },
    to: {
      transform: "translateY(0)",
      opacity: 1,
    },
  },
};

export default AgreementPopup;
