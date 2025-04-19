import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
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
  Gift, 
  Briefcase, 
  TrendingUp, 
  Wallet, 
  RefreshCw, 
  Building2 
} from "lucide-react"

type CategoryDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  type: "income" | "expense";
};

type Status = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

const incomeCategories: Status[] = [
  { value: "salary", label: "Salary", icon: <Wallet className="h-4 w-4 text-gray-500" /> },
  { value: "freelance", label: "Freelance", icon: <Briefcase className="h-4 w-4 text-gray-500" /> },
  { value: "investment", label: "Investment", icon: <TrendingUp className="h-4 w-4 text-gray-500" /> },
  { value: "gift", label: "Gift", icon: <Gift className="h-4 w-4 text-gray-500" /> },
  { value: "refund", label: "Refund", icon: <RefreshCw className="h-4 w-4 text-gray-500" /> },
  { value: "bonus", label: "Bonus", icon: <Wallet className="h-4 w-4 text-gray-500" /> },
  { value: "rental_income", label: "Rental Income", icon: <Building2 className="h-4 w-4 text-gray-500" /> },
];

const expenseCategories: Status[] = [
  { value: "shopping", label: "Shopping", icon: <ShoppingBag className="h-4 w-4 text-gray-500" /> },
  { value: "food", label: "Food", icon: <Utensils className="h-4 w-4 text-gray-500" /> },
  { value: "home", label: "Home", icon: <Home className="h-4 w-4 text-gray-500" /> },
  { value: "entertainment", label: "Entertainment", icon: <Film className="h-4 w-4 text-gray-500" /> },
  { value: "bills", label: "Bills", icon: <Receipt className="h-4 w-4 text-gray-500" /> },
  { value: "travel", label: "Travel", icon: <Plane className="h-4 w-4 text-gray-500" /> },
  { value: "health", label: "Health", icon: <HeartPulse className="h-4 w-4 text-gray-500" /> },
  { value: "education", label: "Education", icon: <GraduationCap className="h-4 w-4 text-gray-500" /> },
  { value: "subscriptions", label: "Subscriptions", icon: <CreditCard className="h-4 w-4 text-gray-500" /> },
  { value: "other", label: "Other", icon: <Receipt className="h-4 w-4 text-gray-500" /> },
];

const CategoryDropdown = ({ value, onChange, type }: CategoryDropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const availableCategories = type === "income" ? incomeCategories : expenseCategories;
  const selectedCategory = availableCategories.find((category) => category.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedCategory ? (
              <>
                {selectedCategory.icon}
                {selectedCategory.label}
              </>
            ) : (
              "Select category..."
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-[9999]" align="start">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {availableCategories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={() => {
                    onChange(category.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.icon}
                    {category.label}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryDropdown;
