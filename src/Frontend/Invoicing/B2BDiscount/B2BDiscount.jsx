import React, { useEffect, useState } from 'react';
import Heading from '../../../components/UI/Heading';
import { useTranslation } from 'react-i18next';
import Input from '../../../components/formComponent/Input';
import { Button } from 'react-bootstrap';
import CustomTable from '../../../components/Table/CustomTable';
import { apiUrls } from '../../../utils/apiUrls';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../../store/reducers/loadingSlice/loadingSlice';
import { notify } from '../../../utils/utils';
import { axiosInstance } from '../../../utils/axiosInstance';
import { useSelector } from 'react-redux';

const B2BDiscount = () => {
const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
    
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [payload, setPayload] = useState({
    labNo: ''
  });

  const [tableData, setTableData] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTableInput = (e, tRow, index) => {
  const { name, value, max } = e.target;
  let newValue = value;

  if (max && Number(value) > Number(max)) {
    newValue = max;
  }

  setTableData((prevData) => {
    const updated = [...prevData];
    updated[index] = { ...updated[index], [name]: newValue };
    return updated;
  });
};


  const getDiscountLedgerData = async (labNo='') => {
    if (!payload?.labNo && !labNo) {
      notify('Kindly enter Lab No.', 'warn');
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await axiosInstance.get(
        `${apiUrls?.GetB2bDiscountLedgertransactionno}?Labno=${labNo || payload?.labNo}`
      );

      const message = res?.data?.message;
      if (Array.isArray(message) && message.length) {
        setTableData(message);
      } else {
        setTableData([]);
        notify('No data found for this Lab No.', 'info');
      }
    } catch (err) {
      console.error(err);
      notify('Error fetching data.', 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateDescount=async()=>{
    dispatch(setLoading(true))
    await axiosInstance.post(apiUrls?.UpdateB2bDiscountLedgertransactionno,{
        ...tableData?.[0]
    })
    .then((res)=>{
        console.log(res);
        notify(res?.data?.message, 'success');
    })
    .catch((err)=>{
        console.log(err);
    })
    .finally(()=>{
        dispatch(setLoading(false))
    })
  }

    const tableHeaders = [
    { header: 'S.No', field: 'SrNo', width: '2%' },
    { header: 'Discount On Total B2B', field: 'DiscountOnTotal_B2B', width: '10%' },
    { header: 'Collection Charges B2B', field: 'CollectionCharges_B2B', width: '10%' },
    { header: 'Action', field: 'action', width: '10%' },
  ];

  const renderTableData = (Array.isArray(tableData) ? tableData : [])?.map((trow, index) => ({
    ...trow,
    SrNo: index+1,
    DiscountOnTotal_B2B: (
      <Input
        type={'number'}
        lable={t('')}
        name="DiscountOnTotal_B2B"
        value={trow?.DiscountOnTotal_B2B}
        onChange={(e) => handleChangeTableInput(e, trow, index)}
        className="w-100"
        max={100000}
      />
    ),
    CollectionCharges_B2B: (
      <Input
        type={'number'}
        lable={t('')}
        name="CollectionCharges_B2B"
        value={trow?.CollectionCharges_B2B}
        onChange={(e) => handleChangeTableInput(e, trow, index)}
        className="w-100"
        max={1000}
      />
    ),
    action: (
        <Button onClick={updateDescount} className="px-4 rounded">
            {t('Update')}
        </Button>
    )
  }));

  useEffect(()=>{
    if(reprintLabNo){
        getDiscountLedgerData(reprintLabNo)
        setPayload(prev=>({...prev, labNo: reprintLabNo}))
    }
    
  }, [reprintLabNo])

  return (
    <>
      <div>
        <Heading title={t('B2B Discount')} />
        <div className="card p-2">
          <div className="row d-flex align-items-center">
            <div className="col-sm-3 col-md-2 col-12">
              <Input
                type={'text'}
                lable={t('Lab No.')}
                name="labNo"
                value={payload?.labNo}
                onChange={handleInputChange}
                className="w-100 mb-0"
              />
            </div>
            <div className="col-auto mb-1">
              <Button onClick={() => getDiscountLedgerData()} className="px-4 rounded">
                {t('Search')}
              </Button>
            </div>
          </div>

          <div className="custom_Table my-3">
            <CustomTable columns={tableHeaders} data={renderTableData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default B2BDiscount;
