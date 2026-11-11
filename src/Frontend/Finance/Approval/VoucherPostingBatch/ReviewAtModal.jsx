import React, { useState } from 'react'
import ReactSelect from '../../../../components/formComponent/ReactSelect'
import { useTranslation } from 'react-i18next';

export default function ReviewAtModal({setModalData}) {
    const [t] = useTranslation()
    
    const [values, setValues] = useState({ReviewAt:{value: "1", label: "Verify User"}});
     const handleModalReactChange = (name, e) => {
        setValues((val) => ({ ...val, [name]: e }));
        setModalData((val) => ({
          ...val,
          modalData: {
            ...val?.modalData,
            [name]: e,
          },
        }))
      }
  return (
    <>
     <ReactSelect
                 placeholderName={t("Review At")}
                 id={"ReviewAt"}
                 searchable={true}
                 respclass="col-xl-12"
                 dynamicOptions={[
                   {
                     value: "0",
                     label: "Entry User",
                   },
                   {
                     value: "1",
                     label: "Verify User",
                   },
                 ]}
                 removeIsClearable={true}
                 name="ReviewAt"
                 handleChange={(name, e) => handleModalReactChange(name, e)}
                 value={values?.ReviewAt?.value}
               />   
    </>
  )
}
