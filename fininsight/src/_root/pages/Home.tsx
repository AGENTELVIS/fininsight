import React, { useEffect, useState } from 'react';
import CreateAccount from './CreateAccount';
import CreateBudget from './CreateBudget';
import Graphs from './Graphs';
import Modal from './UpdateTransactions';
import CardForm from '@/components/forms/CardForm';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <div className="w-full h-full px-4 py-6 overflow-y-auto">
      {/* Top Section: Budget + Add Transaction */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="w-full md:w-2/3">
          <CreateBudget />
        </div>
        <div className="w-full md:w-1/3 flex justify-end">
          <button
            className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded shadow-md"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Graph Section */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <Graphs />
      </div>

      {/* Bottom Section: Pie Chart + Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl shadow-md p-4">
          <CreateAccount />
        </div>
      </div>

      {/* Modal for CardForm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <CardForm onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
