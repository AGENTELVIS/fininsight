import { Models } from 'appwrite'
import { formatCurrency } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AccountInfoCardProps = {
  account: Models.Document;
  onSetDefault: () => void;
  onEdit?: (account: Models.Document) => void;
};

const AccountInfoCard = ({ account, onEdit, onSetDefault }: AccountInfoCardProps) => {
  return (
    <div className='flex items-center justify-between p-2 hover:bg-slate-100 rounded-lg'>
      <div className='flex items-center space-x-3'>
        <div className='h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center'>
          <span className='text-blue-600 font-semibold text-lg'>
            {account.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className='text-sm font-medium'>{account.name}</h3>
          <p className='text-xs text-muted-foreground'>Account</p>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='text-right'>
          <p className='text-sm font-medium'>{formatCurrency(account.amount)}</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Switch
            id={`default-${account.$id}`}
            checked={account.isDefault}
            onCheckedChange={() => onSetDefault()}
          />
          <Label htmlFor={`default-${account.$id}`} className='text-xs'>
            Default
          </Label>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onEdit?.(account)}
          className='h-8 w-8 p-0'
        >
          <Edit className='h-4 w-4 text-gray-600' />
        </Button>
      </div>
    </div>
  )
}

export default AccountInfoCard
