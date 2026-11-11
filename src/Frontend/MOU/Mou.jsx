import React, { useEffect, useState } from 'react'
import { CustomButton } from '../../components/UI/CustomButton'
import Heading from '../../components/UI/Heading'
import Accordion from '../../components/UI/Accordion'
import { axiosInstance } from '../../utils/axiosInstance'

export default function Mou() {
    const [MouType, setMouType] = useState("Certificate")
    const [pdfUrl, setPdfUrl] = useState(null)
    const [loading, setLoading] = useState(false)

    const MOU_OPTIONS = [
        { label: "Certificate", value: "Certificate" },
        { label: "MOU", value: "Mou" },
        { label: "Agreement", value: "Aggrement" },
    ];

    const handleToggle = (value) => {
        setMouType(value);
    };

    const getPdf = async (type) => {
        try {
            setLoading(true);

            const res = await axiosInstance.get(
                `CompanyMaster/GetMouPdf?Type=${type}`
            );

            if(res?.data.success){
                    const base64Pdf = res?.data?.data;

            if (!base64Pdf) {
                throw new Error("No PDF data");
            }

            const byteCharacters = atob(base64Pdf);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob(
                [new Uint8Array(byteNumbers)],
                { type: "application/pdf" }
            );

            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            } else {
                setPdfUrl(null)
            }

            
        } catch (error) {
            console.error("PDF load failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPdf(MouType)
    }, [MouType])

    return (
        <>
            <Heading title={"MOU"} />

            <div className="row px-2 py-2">
                {MOU_OPTIONS.map((item, index) => (
                    <div key={index} className="col-sm-auto d-flex align-items-center justify-content-center mr-3">
                        <label className="switch mt-2">
                            <input
                                type="checkbox"
                                checked={MouType === item.value}
                                onChange={() => handleToggle(item.value)}
                            />
                            <span className="slider"></span>
                        </label>
                        <strong className="ml-2">{item.label}</strong>
                    </div>
                ))}
            </div>


            <Accordion title={MouType}
            
                defaultValue={true}>
                {loading ? (
                    <div className="text-center p-4">Loading PDF...</div>
                ) : pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=0`}
                        width="100%"
                        height="600px"
                        style={{ border: "none" }}
                        title="PDF Viewer"
                    />
                ) : (
                    <div className="text-center p-4">No document found</div>
                )}
            </Accordion>
        </>
    )
}