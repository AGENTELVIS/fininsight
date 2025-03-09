import { Models } from 'appwrite'
import React from 'react'

type AccountInfoProps = {
    account: Models.Document,
};

const AccountInfoCard = ({account}:AccountInfoProps) => {
  return (
    <div>
        <p>{account.name}{account.amount}</p>
    </div>
  )
}

export default AccountInfoCard