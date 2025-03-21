import PdfUploader from '@/components/shared/PdfUploader';
import React from 'react'
import {useDropzone} from "react-dropzone";

const UploadTransactions = () => {
  return (
    <div><PdfUploader/></div>
  )
}

export default UploadTransactions
