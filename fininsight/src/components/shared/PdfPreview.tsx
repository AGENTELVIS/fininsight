import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

type PdfPreviewProps = { fileUrl: string };

const PdfPreview: React.FC<PdfPreviewProps> = ({ fileUrl }) => {
    return (
        <div className="border border-gray-300 shadow-md">
            <Document file={fileUrl}>
                <Page pageNumber={1} scale={1.5} />
            </Document>
        </div>
    );
};

export default PdfPreview;
