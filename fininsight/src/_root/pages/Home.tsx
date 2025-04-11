import React from 'react';
import CreateAccount from './CreateAccount';
import CreateBudget from './CreateBudget';
import Graphs from './Graphs';
import ReceiptDropzone from '@/components/shared/ReceiptDropzone';

const Home = () => {
  return (
    <div className="w-full h-full px-4 py-6 overflow-y-auto">
      {/* Top Section: Budget + Add Transaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CreateBudget />
        <ReceiptDropzone />
      </div>

      {/* Graph Section */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <Graphs />
      </div>

      {/* Bottom Section: Accounts */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <CreateAccount />
      </div>
    </div>
  );
};

export default Home;
