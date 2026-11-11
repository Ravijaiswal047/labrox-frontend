import LabCard from './BusinessLabDashboard/LabCard';
import InactiveClientCard from './BusinessLabDashboard/InactiveClientCard';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Heading from "../../components/UI/Heading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import './LabBusinessDashboard.css';

const LabBusinessDashboard = () => {
  const [t] = useTranslation();
  const [centerSalesData, setCenterSalesData] = useState([]);
  const [clientRevenueData, setClientRevenueData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [inactiveClients, setInactiveClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Card data for Leader Status
  const cardData = [
    {
      id: 1,
      title: 'B2B REGISTRATIONS',
      registrations: '284',
      netAmount: '₹1,42,500',
      icon: '🏥',
      bgColor: '#4a6fff'
    },
    {
      id: 2,
      title: 'B2C REGISTRATIONS',
      registrations: '163',
      netAmount: '₹68,200',
      icon: '👤',
      bgColor: '#00b96b'
    },
    {
      id: 3,
      title: 'HOME COLLECTION',
      registrations: '97',
      netAmount: '₹38,800',
      icon: '🏠',
      bgColor: '#ff8c42'
    }
  ];

  // Dummy data for Center-wise Sales
  const centerSalesDataDummy = [
    {
      id: 1,
      centerName: 'Main Center',
      currentDate: { amount: '₹58,400', points: '142 pts' },
      previousDate: { amount: '₹52,100', points: '130 pts' },
      currentMonth: { amount: '₹7,12,000', points: '1,740 pts' },
      previousMonth: { amount: '₹6,88,500', points: '1,660 pts' }
    },
    {
      id: 2,
      centerName: 'North Branch',
      currentDate: { amount: '₹34,200', points: '68 pts' },
      previousDate: { amount: '₹38,700', points: '95 pts' },
      currentMonth: { amount: '₹4,20,000', points: '1,020 pts' },
      previousMonth: { amount: '₹4,55,000', points: '1,100 pts' }
    },
    {
      id: 3,
      centerName: 'South Branch',
      currentDate: { amount: '₹29,500', points: '72 pts' },
      previousDate: { amount: '₹27,300', points: '68 pts' },
      currentMonth: { amount: '₹3,60,000', points: '880 pts' },
      previousMonth: { amount: '₹3,40,000', points: '832 pts' }
    },
    {
      id: 4,
      centerName: 'East Branch',
      currentDate: { amount: '₹22,800', points: '56 pts' },
      previousDate: { amount: '₹24,500', points: '60 pts' },
      currentMonth: { amount: '₹2,80,000', points: '685 pts' },
      previousMonth: { amount: '₹2,95,000', points: '720 pts' }
    }
  ];

  // Summary data for Center-wise Sales total
  const centerSalesSummary = {
    centerName: 'Total',
    currentDate: { amount: '₹1,44,900', points: '358 pts' },
    previousDate: { amount: '₹1,42,600', points: '353 pts' },
    currentMonth: { amount: '₹17,72,000', points: '4,325 pts' },
    previousMonth: { amount: '₹17,78,500', points: '4,332 pts' }
  };

  // Client-wise Revenue data
  const clientRevenueDataDummy = [
    {
      id: 1,
      clientName: 'Apollo Clinic',
      currentDate: { amount: '₹8,200', trend: 'up', points: '16 pts' },
      previousDate: { amount: '₹7,500', points: '18 pts' },
      currentMonth: { amount: '₹32,000', points: '64 pts' },
      previousMonth: { amount: '₹25,600', points: '88 pts' }
    },
    {
      id: 2,
      clientName: 'MediCare Hospital',
      currentDate: { amount: '₹5,100', trend: 'down', points: '5 pts' },
      previousDate: { amount: '₹6,200', points: '' },
      currentMonth: { amount: '₹68,000', points: '140 pts' },
      previousMonth: { amount: '₹74,000', points: '94 pts' }
    },
    {
      id: 3,
      clientName: 'City Health Clinic',
      currentDate: { amount: '₹3,400', trend: 'up', points: '7 pts' },
      previousDate: { amount: '₹3,100', points: '' },
      currentMonth: { amount: '₹41,200', points: '80 pts' },
      previousMonth: { amount: '₹38,500', points: '85 pts' }
    },
    {
      id: 4,
      clientName: 'Sunrise Diagnostics',
      currentDate: { amount: '₹6,800', trend: 'up', points: '10 pts' },
      previousDate: { amount: '₹6,200', points: '' },
      currentMonth: { amount: '₹78,000', points: '150 pts' },
      previousMonth: { amount: '₹72,000', points: '160 pts' }
    },
    {
      id: 5,
      clientName: 'LifeLine Hospital',
      currentDate: { amount: '₹4,200', trend: 'down', points: '8 pts' },
      previousDate: { amount: '₹5,000', points: '' },
      currentMonth: { amount: '₹55,000', points: '110 pts' },
      previousMonth: { amount: '₹61,000', points: '137 pts' }
    },
    {
      id: 6,
      clientName: 'Harmony Hospital',
      currentDate: { amount: '₹12,500', trend: 'up', points: '19 pts' },
      previousDate: { amount: '₹11,800', points: '17 pts' },
      currentMonth: { amount: '₹1,42,000', points: '210 pts' },
      previousMonth: { amount: '₹1,38,000', points: '204 pts' }
    },
    {
      id: 7,
      clientName: 'Prime Care Center',
      currentDate: { amount: '₹7,300', trend: 'down', points: '10 pts' },
      previousDate: { amount: '₹8,100', points: '' },
      currentMonth: { amount: '₹88,000', points: '145 pts' },
      previousMonth: { amount: '₹95,000', points: '173 pts' }
    },
    {
      id: 8,
      clientName: 'Wellness Clinic',
      currentDate: { amount: '₹5,600', trend: 'up', points: '9 pts' },
      previousDate: { amount: '₹4,900', points: '' },
      currentMonth: { amount: '₹62,000', points: '118 pts' },
      previousMonth: { amount: '₹58,000', points: '122 pts' }
    },
    {
      id: 9,
      clientName: 'Apex Diagnostics',
      currentDate: { amount: '₹3,900', trend: '', points: '6 pts' },
      previousDate: { amount: '₹3,900', points: '' },
      currentMonth: { amount: '₹45,000', points: '92 pts' },
      previousMonth: { amount: 'symbolic value', points: '95 pts' }
    },
    {
      id: 10,
      clientName: 'GreenLeaf Clinic',
      currentDate: { amount: '₹4,400', trend: 'up', points: '8 pts' },
      previousDate: { amount: '₹3,800', points: '' },
      currentMonth: { amount: '₹52,000', points: '105 pts' },
      previousMonth: { amount: '₹48,000', points: '110 pts' }
    },
    {
      id: 11,
      clientName: 'CureCare Hospital',
      currentDate: { amount: '₹2,700', trend: 'down', points: '4 pts' },
      previousDate: { amount: '₹3,200', points: '' },
      currentMonth: { amount: '₹32,000', points: '65 pts' },
      previousMonth: { amount: '₹37,000', points: '82 pts' }
    },
    {
      id: 12,
      clientName: 'QuickTest Labs',
      currentDate: { amount: '₹3,100', trend: 'up', points: '5 pts' },
      previousDate: { amount: '₹2,800', points: '' },
      currentMonth: { amount: '₹38,000', points: '77 pts' },
      previousMonth: { amount: '₹35,000', points: '75 pts' }
    }
  ];

  // Client Revenue Summary
  const clientRevenueSummary = {
    clientName: 'Total',
    currentDate: { amount: '₹63,500', points: '99 pts' },
    previousDate: { amount: '₹61,700', points: '' },
    currentMonth: { amount: '₹7,33,200', points: '1,773 pts' },
    previousMonth: { amount: '₹6,97,500', points: '1,673 pts' }
  };

  // Department-wise Revenue data
  const departmentDataDummy = [
    {
      id: 1,
      department: 'Biochemistry',
      icon: '⚗️',
      quantity: '450',
      grossAmount: '₹1,60,000',
      discount: '₹12,000',
      netAmount: '₹1,68,000'
    },
    {
      id: 2,
      department: 'Radiology',
      icon: '🔬',
      quantity: '210',
      grossAmount: '₹95,000',
      discount: '₹8,500',
      netAmount: '₹86,500'
    },
    {
      id: 3,
      department: 'Pathology',
      icon: '🔬',
      quantity: '180',
      grossAmount: '₹72,000',
      discount: '₹5,200',
      netAmount: '₹66,800'
    },
    {
      id: 4,
      department: 'Haematology',
      icon: '🩸',
      quantity: '135',
      grossAmount: '₹54,000',
      discount: '₹3,800',
      netAmount: '₹50,200'
    },
    {
      id: 5,
      department: 'Microbiology',
      icon: '🦠',
      quantity: '98',
      grossAmount: '₹39,200',
      discount: '₹2,400',
      netAmount: '₹36,800'
    }
  ];

  // Department Summary
  const departmentSummary = {
    department: 'Total',
    quantity: '1,073',
    grossAmount: '₹4,40,200',
    discount: '₹31,900',
    netAmount: '₹4,08,300'
  };

  // Inactive Clients Data
  const inactiveClientsData = [
    {
      id: 1,
      clientName: 'XYZ Diagnostics',
      branch: 'North Branch',
      lastDate: '12 Aug 2025',
      lastBill: '₹12,200',
      daysInactive: 92,
      borderColor: '#e74c3c'
    },
    {
      id: 2,
      clientName: 'HealthFirst Hospital',
      branch: 'East Branch',
      lastDate: '27 Aug 2025',
      lastBill: '₹22,800',
      daysInactive: 78,
      borderColor: '#e74c3c'
    },
    {
      id: 3,
      clientName: 'NovaCare Clinic',
      branch: 'South Branch',
      lastDate: '09 Sep 2025',
      lastBill: '₹9,400',
      daysInactive: 65,
      borderColor: '#e74c3c'
    },
    {
      id: 4,
      clientName: 'BlueShield Labs',
      branch: 'Main Center',
      lastDate: '13 Sep 2025',
      lastBill: '₹31,500',
      daysInactive: 61,
      borderColor: '#e74c3c'
    },
    {
      id: 5,
      clientName: 'MedPoint Clinic',
      branch: 'North Branch',
      lastDate: '19 Sep 2025',
      lastBill: '₹7,600',
      daysInactive: 55,
      borderColor: '#e74c3c'
    },
    {
      id: 6,
      clientName: 'Starcare Hospital',
      branch: 'East Branch',
      lastDate: '26 Sep 2025',
      lastBill: '₹18,900',
      daysInactive: 48,
      borderColor: '#e74c3c'
    }
  ];

  // Load dummy data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCenterSalesData(centerSalesDataDummy);
      setClientRevenueData(clientRevenueDataDummy);
      setDepartmentData(departmentDataDummy);
      setInactiveClients(inactiveClientsData);
      setIsLoading(false);
    }, 500);
  };

  // Render Center-wise Sales table
  const renderCenterSalesTable = () => {
    return (
      <tbody>
        {centerSalesData.map((data, index) => (
          <tr key={data.id || index} className="center-sales-row">
            <td className="center-name" data-title={t("Center Name")}>
              <span className="center-icon">🏢</span>
              {data.centerName}
            </td>
            <td className="amount-cell" data-title={t("Current Date (14 Nov)")}>
              <div className="amount-value">{data.currentDate.amount}</div>
              <div className="points-value">{data.currentDate.points}</div>
            </td>
            <td className="amount-cell" data-title={t("Previous Date (13 Nov)")}>
              <div className="amount-value">{data.previousDate.amount}</div>
              <div className="points-value">{data.previousDate.points}</div>
            </td>
            <td className="amount-cell" data-title={t("Current Month (Nov)")}>
              <div className="amount-value">{data.currentMonth.amount}</div>
              <div className="points-value">{data.currentMonth.points}</div>
            </td>
            <td className="amount-cell" data-title={t("Previous Month (Oct)")}>
              <div className="amount-value">{data.previousMonth.amount}</div>
              <div className="points-value">{data.previousMonth.points}</div>
            </td>
          </tr>
        ))}
        <tr className="total-summary-row">
          <td className="total-label" data-title={t("Center Name")}>
            <span className="total-icon">🏦</span>
            {centerSalesSummary.centerName}
          </td>
          <td className="total-amount" data-title={t("Current Date (14 Nov)")}>
            <div className="amount-value total">{centerSalesSummary.currentDate.amount}</div>
            <div className="points-value total-points">{centerSalesSummary.currentDate.points}</div>
          </td>
          <td className="total-amount" data-title={t("Previous Date (13 Nov)")}>
            <div className="amount-value total">{centerSalesSummary.previousDate.amount}</div>
            <div className="points-value total-points">{centerSalesSummary.previousDate.points}</div>
          </td>
          <td className="total-amount" data-title={t("Current Month (Nov)")}>
            <div className="amount-value total">{centerSalesSummary.currentMonth.amount}</div>
            <div className="points-value total-points">{centerSalesSummary.currentMonth.points}</div>
          </td>
          <td className="total-amount" data-title={t("Previous Month (Oct)")}>
            <div className="amount-value total">{centerSalesSummary.previousMonth.amount}</div>
            <div className="points-value total-points">{centerSalesSummary.previousMonth.points}</div>
          </td>
        </tr>
      </tbody>
    );
  };

  // Render Client-wise Revenue table
  const renderClientRevenueTable = () => {
    return (
      <tbody>
        {clientRevenueData.map((data, index) => (
          <tr key={data.id || index} className="center-sales-row">
            <td className="center-name" data-title={t("Client Name")}>{data.clientName}</td>
            <td className="amount-cell" data-title={t("Current Date (14 Nov)")}>
              <div className="amount-value">
                {data.currentDate.amount} 
                {data.currentDate.trend === 'up' && <span className="trend-up"> ▲</span>}
                {data.currentDate.trend === 'down' && <span className="trend-down"> ▼</span>}
              </div>
              <div className="points-value">{data.currentDate.points}</div>
            </td>
            <td className="amount-cell" data-title={t("Previous Date (13 Nov)")}>
              <div className="amount-value">{data.previousDate.amount}</div>
              <div className="points-value">{data.previousDate.points}</div>
            </td>
            <td className="amount-cell" data-title={t("Current Month (Nov)")}>
              <div className="amount-value">{data.currentMonth.amount}</div>
              <div className="points-value">{data.currentMonth.points}</div>
            </td>
            <td className="amount-cell" data-title={t("Previous Month (Oct)")}>
              <div className="amount-value">{data.previousMonth.amount}</div>
              <div className="points-value">{data.previousMonth.points}</div>
            </td>
          </tr>
        ))}
        <tr className="total-summary-row">
          <td className="total-label" data-title={t("Client Name")}>
            <span className="total-icon">🏦</span>
            {clientRevenueSummary.clientName}
          </td>
          <td className="total-amount" data-title={t("Current Date (14 Nov)")}>
            <div className="amount-value total">{clientRevenueSummary.currentDate.amount}</div>
            <div className="points-value total-points">{clientRevenueSummary.currentDate.points}</div>
          </td>
          <td className="total-amount" data-title={t("Previous Date (13 Nov)")}>
            <div className="amount-value total">{clientRevenueSummary.previousDate.amount}</div>
            <div className="points-value total-points">{clientRevenueSummary.previousDate.points}</div>
          </td>
          <td className="total-amount" data-title={t("Current Month (Nov)")}>
            <div className="amount-value total">{clientRevenueSummary.currentMonth.amount}</div>
            <div className="points-value total-points">{clientRevenueSummary.currentMonth.points}</div>
          </td>
          <td className="total-amount" data-title={t("Previous Month (Oct)")}>
            <div className="amount-value total">{clientRevenueSummary.previousMonth.amount}</div>
            <div className="points-value total-points">{clientRevenueSummary.previousMonth.points}</div>
          </td>
        </tr>
      </tbody>
    );
  };

  // Render Department-wise Revenue table
  const renderDepartmentTable = () => {
    return (
      <tbody>
        {departmentData.map((data, index) => (
          <tr key={data.id || index} className="center-sales-row">
            <td className="center-name" data-title={t("Department")}>
              <span className="dept-icon">{data.icon}</span>
              {data.department}
            </td>
            <td className="amount-cell" data-title={t("Quantity")}>
              <div className="amount-value">{data.quantity}</div>
            </td>
            <td className="amount-cell" data-title={t("Gross Amount")}>
              <div className="amount-value">{data.grossAmount}</div>
            </td>
            <td className="amount-cell" data-title={t("Discount")}>
              <div className="amount-value discount-value">{data.discount}</div>
            </td>
            <td className="amount-cell" data-title={t("Net Amount")}>
              <div className="amount-value">{data.netAmount}</div>
            </td>
          </tr>
        ))}
        <tr className="total-summary-row">
          <td className="total-label" data-title={t("Department")}>
            <span className="total-icon">🏦</span>
            {departmentSummary.department}
          </td>
          <td className="total-amount" data-title={t("Quantity")}>
            <div className="amount-value total">{departmentSummary.quantity}</div>
          </td>
          <td className="total-amount" data-title={t("Gross Amount")}>
            <div className="amount-value total">{departmentSummary.grossAmount}</div>
          </td>
          <td className="total-amount" data-title={t("Discount")}>
            <div className="amount-value total discount-value">{departmentSummary.discount}</div>
          </td>
          <td className="total-amount" data-title={t("Net Amount")}>
            <div className="amount-value total">{departmentSummary.netAmount}</div>
          </td>
        </tr>
      </tbody>
    );
  };

  return (
    <>
      <div className="mt-2">
        <Accordion title={t("LabBusiness")} defaultValue={true}>
          {/* Cards Section - Leader Status */}
          <div className="cards-grid">
            {cardData.map((card) => (
              <LabCard
                key={card.id}
                title={card.title}
                registrations={card.registrations}
                netAmount={card.netAmount}
                icon={card.icon}
                bgColor={card.bgColor}
              />
            ))}
          </div>

          {/* Center-wise Sales Table */}
          <div className="mt-4">
            {centerSalesData.length > 0 ? (
              <div className="row px-1">
                <div className="col-12 mb-0">
                  <Heading title={t("Center-wise Sales")} />
                  <div className="table-responsive">
                    <Tables className="center-sales-table">
                      <thead className="cf">
                        <tr>
                          <th>{t("Center Name")}</th>
                          <th>{t("Current Date (14 Nov)")}</th>
                          <th>{t("Previous Date (13 Nov)")}</th>
                          <th>{t("Current Month (Nov)")}</th>
                          <th>{t("Previous Month (Oct)")}</th>
                        </tr>
                      </thead>
                      {renderCenterSalesTable()}
                    </Tables>
                  </div>
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </div>

          {/* Client-wise Revenue Table */}
          <div className="mt-4">
            {clientRevenueData.length > 0 ? (
              <div className="row px-1">
                <div className="col-12 mb-0">
                  <Heading title={t("Client-wise Revenue")} />
                  <div className="table-responsive">
                    <Tables className="center-sales-table">
                      <thead className="cf">
                        <tr>
                          <th>{t("Client Name")}</th>
                          <th>{t("Current Date (14 Nov)")}</th>
                          <th>{t("Previous Date (13 Nov)")}</th>
                          <th>{t("Current Month (Nov)")}</th>
                          <th>{t("Previous Month (Oct)")}</th>
                        </tr>
                      </thead>
                      {renderClientRevenueTable()}
                    </Tables>
                  </div>
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </div>

          {/* Department-wise Revenue Summary */}
          <div className="mt-4">
            {departmentData.length > 0 ? (
              <div className="row px-1">
                <div className="col-12 mb-0">
                  <Heading title={t("Department-wise Revenue Summary")} />
                  <div className="table-responsive">
                    <Tables className="center-sales-table">
                      <thead className="cf">
                        <tr>
                          <th>{t("Department")}</th>
                          <th>{t("Quantity")}</th>
                          <th>{t("Gross Amount")}</th>
                          <th>{t("Discount")}</th>
                          <th>{t("Net Amount")}</th>
                        </tr>
                      </thead>
                      {renderDepartmentTable()}
                    </Tables>
                  </div>
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </div>

          {/* Inactive Clients Section */}
          <div className="inactive-clients-section">
            <div className="inactive-section-header">
              <span className="inactive-section-icon"></span>
              <h3 className="inactive-section-title">{t("Inactive Clients — Last 3 Months")}</h3>
            </div>
            <p className="inactive-section-subtitle">
              <span className="warning-icon">⚠️</span>
              {t("Clients with no business in last 3 months. Last transaction shown.")}
            </p>
            <div className="inactive-clients-grid">
              {inactiveClients.map((client) => (
                <InactiveClientCard
                  key={client.id}
                  clientName={client.clientName}
                  branch={client.branch}
                  lastDate={client.lastDate}
                  lastBill={client.lastBill}
                  daysInactive={client.daysInactive}
                  borderColor={client.borderColor}
                />
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </Accordion>
      </div>
    </>
  );
};

export default LabBusinessDashboard;