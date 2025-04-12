import { Models } from 'appwrite'
import React from 'react'
import { formatCurrency } from '@/lib/utils'

type AccountInfoProps = {
    account: Models.Document,
};

const AccountInfoCard = ({account}: AccountInfoProps) => {
  return (
    <div className='flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100'>
        <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
                <span className='text-blue-600 font-semibold text-lg'>
                    {account.name.charAt(0).toUpperCase()}
                </span>
            </div>
            <div>
                <h3 className='text-gray-800 font-medium'>{account.name}</h3>
                <p className='text-sm text-gray-500'>Account Balance</p>
            </div>
        </div>
        <div className='text-right'>
            <p className='text-xl font-semibold text-gray-900'>
                {formatCurrency(account.amount)}
            </p>
        </div>
    </div>
  )
}

export default AccountInfoCard