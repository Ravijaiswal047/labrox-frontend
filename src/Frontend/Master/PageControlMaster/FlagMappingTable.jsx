import React from 'react';
import Tables from '../../../components/UI/customTable';
import { Form } from 'react-bootstrap';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import Input from '../../../components/formComponent/Input';

const FlagMappingTable = ({ data, setFlagTableData }) => {
    
    const handleFlagChange = (index, newValue) => {
        const updatedData = [...data];
        updatedData[index] = { 
            ...updatedData[index], 
            FlagValue: newValue,
            isChanged: true
        };
        setFlagTableData(updatedData);
    };

    const renderControl = (item, index) => {
        switch (item.ControlType) {
            case 'Checkbox':
                return (
                    <Form.Check
                        type="switch"
                        id={`flag-switch-${index}`}
                        checked={item.FlagValue === "1"}
                        onChange={(e) => handleFlagChange(index, e.target.checked ? "1" : "0")}
                    />
                );
            case 'Dropdown':
                const options = item.PossibleValues.split('|').map(val => ({
                    label: val,
                    value: val
                }));
                return (
                    <ReactSelect
                        dynamicOptions={options}
                        value={item.FlagValue}
                        label={"flag"}
                        placeholderName={"flag"}
                        removeIsClearable={true}
                        onChange={(name, e) => handleFlagChange(index, e.value)}
                        respclass="w-100"
                    />
                );
            case 'TextBox':
            default:
                return (
                    <Input
                        type="text"
                        lable={"Flag"}
                        value={item.FlagValue}
                        onChange={(e) => handleFlagChange(index, e.target.value)}
                        respclass="w-100"
                    />
                );
        }
    };

    return (
        <div className="table-responsive" style={{ width: "5 00px", minHeight: "220px" }}>
            <Tables className="table table-bordered custom-table">
                <thead>
                    <tr>
                        <th style={{ width: "5%" }}>SrNo</th>
                        <th style={{ width: "45%" }}>Flag Description</th>
                        <th style={{ width: "50%" }}>Value / Control</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.FlagID || index}>
                            <td>{index + 1}</td>
                            <td>{item.FlagName}</td>
                            <td>{renderControl(item, index)}</td>
                        </tr>
                    ))}
                </tbody>
            </Tables>
        </div>
    );
};

export default FlagMappingTable;