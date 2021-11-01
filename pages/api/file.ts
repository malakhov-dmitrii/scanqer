import { IncomingForm } from 'formidable';
// you might want to use regular 'fs' and not a promise one
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import gm from 'gm';
import { fromPath } from 'pdf2pic';
import pdfDocument from 'pdfkit';

import { random, values } from 'lodash';

const applyStyles = (path: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    gm(path)
      .contrast(2)
      .rotate('#ededed', random(-2, 2, true))
      .noise('laplacian')
      .toBuffer((err, buffer) => {
        if (!err) resolve(buffer);
      });
  });

// first we need to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // parse form with a Promise wrapper
  const data: any = await new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });

  console.log('data received');

  const files: Buffer[] = [];
  for (const file of values(data)) {
    const path = file.filepath;
    const r = await applyStyles(path);
    files.push(r);
  }
  console.log('styles applied');

  // Create PDF
  var doc = new pdfDocument({ autoFirstPage: false });

  // // Write headers
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Access-Control-Allow-Origin': '*',
    'Content-Disposition': 'attachment; filename=Untitled.pdf',
  });

  // Pipe generated PDF into response
  doc.pipe(res);

  files.forEach((file, idx) => {
    // @ts-ignore
    var img = doc.openImage(file);
    doc.addPage({ size: [img.width, img.height] });
    doc.image(img, 0, 0);
    // doc.addPage({ size: 'A4', margin: 0 });
    // doc.image(file, { align: 'center' });
  });
  doc.end();
  console.log('ended');

  return;
};

export default handler;
