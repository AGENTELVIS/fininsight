import React, { useState } from 'react';
import CreateAccount from './CreateAccount';
import CreateBudget from './CreateBudget';
import Graphs from './Graphs';
import CardForm from '@/components/forms/CardForm';
import SmartInsight from '@/components/shared/SmartInsights';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full h-full px-4 py-6 overflow-y-auto">
      <div>
        <SmartInsight/>
      </div>
      {/* Top Section: Budget + Add Transaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CreateBudget />
        <CardForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
