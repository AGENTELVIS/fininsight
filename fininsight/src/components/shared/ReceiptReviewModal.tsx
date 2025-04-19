import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExtractedData } from '@/types';
import AccountDropdown from './AccountDropdown';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ShoppingBag, 
  Utensils, 
  Home, 
  Film, 
  Receipt, 
  Plane, 
  HeartPulse, 
  GraduationCap, 
  CreditCard, 
} from "lucide-react";

type ReceiptReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: ExtractedData;
  onConfirm: (accountId: string, saveImage: boolean) => void;
  imagePreview?: string;
};

const getCategoryIcon = (category: string) => {
  const iconSize = "h-4 w-4";
  const iconClass = "text-gray-500";

  switch (category) {
    case "shopping":
      return <ShoppingBag className={`${iconSize} ${iconClass}`} />;
    case "food":
      return <Utensils className={`${iconSize} ${iconClass}`} />;
    case "home":
      return <Home className={`${iconSize} ${iconClass}`} />;
    case "entertainment":
      return <Film className={`${iconSize} ${iconClass}`} />;
    case "bills":
      return <Receipt className={`${iconSize} ${iconClass}`} />;
    case "travel":
      return <Plane className={`${iconSize} ${iconClass}`} />;
    case "health":
      return <HeartPulse className={`${iconSize} ${iconClass}`} />;
    case "education":
      return <GraduationCap className={`${iconSize} ${iconClass}`} />;
    case "subscriptions":
      return <CreditCard className={`${iconSize} ${iconClass}`} />;
    case "other":
      return <Receipt className={`${iconSize} ${iconClass}`} />;
    default:
      return <Receipt className={`${iconSize} ${iconClass}`} />;
  }
};

const ReceiptReviewModal: React.FC<ReceiptReviewModalProps> = ({
  isOpen,
  onClose,
  data,
  onConfirm,
  imagePreview,
}) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [saveImage, setSaveImage] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Review Receipt Details</h2>
        
        <div className="space-y-4">
          {imagePreview && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Receipt Preview</p>
              <img 
                src={imagePreview} 
                alt="Receipt preview" 
                className="max-h-40 rounded-lg object-contain border"
              />
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500">Merchant</p>
            <p className="font-medium">{data.merchant || 'Unknown Merchant'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium">₹{data.total}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{data.date}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <div className="flex items-center gap-2">
              {data.category && getCategoryIcon(data.category)}
              <p className="font-medium capitalize">{data.category || 'other'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Account</p>
            <AccountDropdown 
              value={selectedAccount} 
              onChange={(value) => setSelectedAccount(value)}
            />
          </div>

          {imagePreview && (
            <div className="flex items-center space-x-2">
              <Switch
                id="save-image"
                checked={saveImage}
                onCheckedChange={setSaveImage}
              />
              <Label htmlFor="save-image">Save receipt image</Label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(selectedAccount, saveImage)}
            disabled={!selectedAccount}
          >
            Create Transaction
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReceiptReviewModal; 