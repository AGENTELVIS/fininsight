import React from 'react'
import RecordDetails from './RecordDetails'
import RecordsTable from '@/components/shared/RecordsTable'

const Records = () => {
  return (
    <>
    <div className='overflow-auto w-full'>
    <div><RecordsTable/></div>
    </div>
    </>
  )
}

export default Records