import React, { useState } from "react";
import Heading from "../../components/UI/Heading";

const EqasComment = () => {
  const [comment, setComment] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="comment_pop_main">
        <Heading title={"Corrective Action Comment"} />

        <div className="px-2 py-2">
          <TextAreaInput
            name="comment"
            lable="Comment"
            id="comment"
            value={payload.comment}
            placeholder=" "
            rows={10}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );
};

export default EqasComment;
