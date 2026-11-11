import React from "react";
import { SelectBox } from "../../components/formComponent/SelectBox";

const SampleHisto = ({ name, lable, handleChange, value }) => {
  const noOfCasset = generateNumbersArray();
  function generateNumbersArray() {
    const numbers = [];
    for (let i = 0; i <= 200; i++) {
      const object = { label: i.toString(), value: i.toString() };
      numbers.push(object);
    }
    return numbers;
  }
  console.log(value);
  return (
    <>
      <div title={lable}>
        <SelectBox
          name={name}
          onChange={handleChange}
          options={noOfCasset}
          lable={lable}
          className="mt-2"
          selectedValue={value}
        />
      </div>   
    </>
  );
};

export default SampleHisto;
