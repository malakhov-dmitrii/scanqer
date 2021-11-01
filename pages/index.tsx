import type { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(import('../components/PDFViewer'), { ssr: false });

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>scanqer</title>
        <meta name="description" content="Make your PDF docs look like its scanned" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content">
          <div className="flex-1 px-2 mx-2">
            <span className="text-lg font-bold">scanqer</span>
          </div>
        </div>
      </div>

      <main className="prose m-auto py-12 px-4 min-h-screen">
        <h1>Make PDF look like scanned</h1>
        <p>Just pick file - once its ready you`ll be able to download it.</p>
        <p>We dont store them and dont send them anywhere</p>

        <div>
          <PDFViewer />
        </div>
      </main>

      <footer className="items-center p-4 footer bg-neutral text-neutral-content">
        <div className="items-center grid-flow-col">
          <p>Copyright © 2021 - All right reserved</p>
        </div>
        <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <a href="mailto:mitia2022@gmail.com?subject=scanqer" target="_blank" className="" rel="noreferrer">
            If something went wrong - let us know
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
