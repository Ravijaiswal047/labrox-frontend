import React, { useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import { number, autocompleteOnBlur } from "../../utils/helpers";
import { CancelButton, SearchButton } from "../../components/UI/CustomButton";

function RSadvanceFilter({
  show,
  handleShow,
  handleAdvSearch,
  data,
  handleFilterChange,
}) {
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [testSearch, setTestSearch] = useState("");
  const [filterTest, setFilterTest] = useState([]);
  const [dropTest, setDropTest] = useState(false);
  const [indexTest, setIndexTest] = useState(0);
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    if (data?.parameterId && TestSuggestion.length > 0) {
      const ids = typeof data.parameterId === "string" 
        ? data.parameterId.split(",") 
        : Array.isArray(data.parameterId) 
          ? data.parameterId.map(String) 
          : [];
          
      const selected = TestSuggestion.filter(test => ids.includes(String(test.value)));
      setSelectedTests(selected);
    } else {
      setSelectedTests([]);
    }
  }, [data?.parameterId, TestSuggestion]);

  const handleTestSearch = (e) => {
    const { value } = e.target;
    setTestSearch(value);
    setFilterTest(
      TestSuggestion.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase())
      )
    );
    setDropTest(true);
  };

  const handleTestSelect = (item) => {
    if (!selectedTests.find((s) => s.value === item.value)) {
      const updated = [...selectedTests, item];
      setSelectedTests(updated);
      const ids = updated.map((s) => Number(s.value));
      handleSelectMultiChange("parameterId", ids);
    }
    setTestSearch("");
    setFilterTest([]);
    setDropTest(false);
  };

  const handleRemoveTest = (value) => {
    const updated = selectedTests.filter((s) => s.value !== value);
    setSelectedTests(updated);
    const ids = updated.map((s) => Number(s.value));
    handleSelectMultiChange("parameterId", ids);
  };

  const handleTestKeyDown = (e) => {
    switch (e.which) {
      case 38:
        setIndexTest(
          indexTest === 0 ? filterTest.length - 1 : indexTest - 1
        );
        break;
      case 40:
        setIndexTest(
          indexTest === filterTest.length - 1 ? 0 : indexTest + 1
        );
        break;
      case 13:
        if (filterTest[indexTest]) {
          handleTestSelect(filterTest[indexTest]);
          setIndexTest(0);
        }
        break;
      default:
        break;
    }
  };

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;

        let MapTest = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });

        setTestSuggestion(MapTest);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getInvestigationList();
  }, []);

  const handleSelectMultiChange = (name, value) => {
    // const val = select?.map((ele) => ele?.value);
    let e = { target: { name: name, value: value } };
    return handleFilterChange(e);
  };

  const closeDialog = () => {
    if (typeof handleShow === "function") {
      handleShow();
    }
  };

  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      header={<span>Advance Filter</span>}
      style={{ width: "40%" }}
      visible={!!show}
      onHide={closeDialog}
      closable={false}
      dismissableMask
      className={theme}
      footer={
        <div className="d-flex justify-content-end" style={{ gap: "8px" }}>
          <SearchButton
            type="button"
            onClick={handleAdvSearch}
            text={"Search"}
          />
          <CancelButton
            type="button"
            onClick={closeDialog}
            text={"Close"}
          />
        </div>
      }
    >
      <div className="">
        <div className="row">
          <label className="col-sm-4">Parameter Name</label>
          <div className="col-sm-8">
            <div className="flex-grow-1 mb-2 d-flex">
              <Input
                autoComplete="off"
                placeholder=" "
                lable="Select Multi Parameter Name"
                id="SearchTest"
                name="testSearch"
                type="text"
                value={testSearch}
                respclass={"flex-grow-1"}
                onChange={handleTestSearch}
                onKeyDown={handleTestKeyDown}
                onBlur={() => {
                  autocompleteOnBlur(setDropTest);
                }}
              />
              {dropTest && filterTest.length > 0 && (
                <ul className="suggestion-data" style={{ zIndex: 99 }}>
                  {filterTest.map((data, index) => (
                    <li
                      onClick={() => handleTestSelect(data)}
                      className={`${index === indexTest && "matchIndex"}`}
                      key={index}
                    >
                      {data.label}
                    </li>
                  ))}
                </ul>
              )}
              {selectedTests?.length > 0 && (
                <span className="d-flex align-items-center counticon">
                  {selectedTests?.length > 0 ? selectedTests?.length : 0}
                  <i
                    className="bi bi-info-circle-fill infoIcon_cls"
                    data-tooltip-id="test-tooltip"
                  ></i>
                  <ReactTooltip
                    id="test-tooltip"
                    place="top"
                    clickable={true}
                    content={
                      <div>
                        <h2 className="mb-1 border-bottom">
                          Selected Parameters ({selectedTests.length})
                        </h2>
                        <ul className="mb-0 pl-3">
                          {selectedTests?.map((test, idx) => (
                            <li
                              key={test.value}
                              className="mb-2 d-flex justify-content-between align-items-center"
                            >
                              <span>
                                {idx + 1}. {test.label}
                              </span>
                              <i
                                className="fa fa-times ml-2"
                                style={{
                                  cursor: "pointer",
                                  color: "red",
                                }}
                                onClick={() =>
                                  handleRemoveTest(test.value)
                                }
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    }
                    style={{ zIndex: 9999 }}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4"></div>
          <div className="col-sm-4">
            <SelectBox
              options={[
                { label: "Select", value: "" },
                { label: ">", value: ">" },
                { label: "<", value: "<" },
                { label: "=", value: "=" },
              ]}
              name={"valueCheck"}
              selectedValue={data?.valueCheck}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-sm-4">
            <Input
              className="select-input-box form-control input-sm"
              placeholder={"Enter Value to Search"}
              name={"valueToSearch"}
              value={data?.valueToSearch}
              onChange={handleFilterChange}
              onInput={(e) => number(e, 2)}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4"></div>
          <div className="col-sm-4">
            <Input
              className="select-input-box form-control input-sm"
              placeholder={"Value Range From"}
              name={"valueRangeFrom"}
              value={data?.valueRangeFrom}
              onChange={handleFilterChange}
              onInput={(e) => number(e, 2)}
            />
          </div>
          <div className="col-sm-4">
            <Input
              className="select-input-box form-control input-sm"
              placeholder={"Value Range To"}
              name={"valueRangeTo"}
              value={data?.valueRangeTo}
              onChange={handleFilterChange}
              onInput={(e) => number(e, 4)}
            />
          </div>
        </div>
        <div className="row">&nbsp;</div>
      </div>
    </Dialog>
  );
}

export default RSadvanceFilter;
