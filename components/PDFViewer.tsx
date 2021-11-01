import React, { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { useCounter, useList, useToggle } from 'react-use';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const toBase64 = (file: File): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) resolve(reader.result);
    };
    reader.onerror = error => reject(error);
  });

// const canvasToJpg = (canvas:HTMLCanvasElement) => {
//   const data = canvas.toDataURL('image/jpg')
// }

const PDFViewer = () => {
  const [stage, setStage] = useState<'idle' | 'preparing' | 'styling'>('idle');
  const [error, setError] = useState(null);

  const ref = useRef<HTMLCanvasElement>(null);
  const [numPages, setNumPages] = useState(null);
  const [page, { inc: nextPage, dec: prevPage, reset }] = useCounter(1, numPages, 1);
  const [jpgDataItems, jpgList] = useList<Blob>([]);

  const [fileName, setFileName] = useState('');

  const [file, setFile] = useState<string | ArrayBuffer | null>(null);

  const onDocumentLoadSuccess = (doc: any) => {
    setNumPages(doc.numPages);
  };

  const uploadToClient = async (event: any) => {
    reset();
    setNumPages(null);
    jpgList.reset();
    setFileName('');
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      toBase64(i).then(setFile);
      setFileName(i.name);
      setStage('preparing');
    }
  };

  const uploadToServer = async () => {
    setNumPages(null);
    reset();
    setFile(null);
    const form = new FormData();
    jpgDataItems.forEach((blob, idx) => {
      form.append(`file[${idx}]`, blob);
    });
    fetch('/api/file', { body: form, method: 'POST' })
      .then(response => response.blob())
      .then(blob => {
        setStage('idle');
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace('.pdf', '')}_scanned.pdf`;
        setFileName('');
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        a.remove(); //afterwards we remove the element again
      });
  };

  useEffect(() => {
    if (jpgDataItems.length === numPages) {
      console.log('ready to upload');
      setStage('styling');
      uploadToServer();
    }
  }, [numPages, jpgDataItems]);

  return (
    <div className="relative">
      <div className="flex">
        <div className="form-control">
          <input
            type="file"
            disabled={stage !== 'idle'}
            className="p-3 font-mono text-sm card bordered shadow"
            name="myImage"
            onChange={uploadToClient}
          />
        </div>
      </div>

      {stage !== 'idle' && (
        <div className="animate-pulse">
          {stage === 'preparing' && <h2>Preparing the document...</h2>}
          {stage === 'styling' && <h2>Applying styles...</h2>}
        </div>
      )}

      {file && (
        <div className="mt-4 shadow-md p-2">
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={page}
              width={500}
              canvasRef={ref}
              onRenderSuccess={() => {
                console.log(`rendered page ${page}`);
                ref.current?.toBlob(blob => {
                  if (blob) {
                    jpgList.push(blob);
                    nextPage();
                  } else {
                    console.log('error creating the blob');
                  }
                });
              }}
            />
          </Document>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
