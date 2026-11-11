import React from "react";
import Modal from "@components/formComponent/Modal";
import { CustomButton, CancelButton } from "@components/UI/CustomButton";
import { toLayoutJson, downloadLayoutJson } from "../utils/layoutJson";

export default function LayoutJsonModal({ visible, setVisible, state }) {
  const json = JSON.stringify(toLayoutJson(state), null, 2);

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header="LayoutJson"
      modalWidth="760px"
      buttons={
        <>
          <CustomButton text="Download .json" icon="download" variant="primary" onClick={() => downloadLayoutJson(state)} />
          <CancelButton text="Close" onClick={() => setVisible(false)} />
        </>
      }
    >
      <pre className="rbn-json-view">{json}</pre>
    </Modal>
  );
}
