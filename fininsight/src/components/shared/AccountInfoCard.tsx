import { Models } from 'appwrite'
import React from 'react'

type AccountInfoProps = {
    account: Models.Document,
};

const AccountInfoCard = ({account}:AccountInfoProps) => {
  return (
    <div className='flex justify-between'>
        <div className='justify-between flex'>
          <p className=''>{account.name}</p>
          <p className=''>{account.amount}</p>
        </div>
        <div className='border-none outline-none'></div>
    </div>
  )
}

export default AccountInfoCard