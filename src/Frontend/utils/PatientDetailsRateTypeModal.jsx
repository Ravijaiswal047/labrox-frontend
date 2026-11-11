export const RateTypeModal = ({ data }) => {
  return (
    <>

    
      <div className="row mb-2">
        
       
      </div>

      <div className="row mb-2">
        <div className="col-md-6">
          <b> Name:</b> {data?.RateTypeName}
        </div>
        <div className="col-md-6">
          <b>Address:</b> {data?.RateTypeAddress}
        </div>
      </div>
      <div className="row mb-2">
        <div className="col-md-6">
          <b>Sales Maanager:</b> {data?.SalesManagerName}
        </div>
        <div className="col-md-6">
          <b>Field Boy:</b> {data?.FeildBoyName}
        </div>
      </div>
      <div className="row mb-2">
        <div className="col-md-6">
          <b>Mobile No.:</b> {data?.RateTypeMobileNo}
        </div>
        <div className="col-md-6">
          <b>Email:</b> {data?.RateTypeEmailID}
        </div>
      </div>
    </>
  );
};
