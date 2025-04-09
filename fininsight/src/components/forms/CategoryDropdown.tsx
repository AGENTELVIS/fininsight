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

type CategoryDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  type: "income" | "expense";
};

type Status = {
  value: string;
  label: string;
};

const incomeCategories: Status[] = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "gift", label: "Gift" },
  { value: "refund", label: "Refund" },
  { value: "bonus", label: "Bonus" },
  { value: "rental_income", label: "Rental Income" },
];

const expenseCategories: Status[] = [
  { value: "shopping", label: "Shopping" },
  { value: "food", label: "Food" },
  { value: "home", label: "Home" },
  { value: "entertainment", label: "Entertainment" },
  { value: "bills", label: "Bills" },
  { value: "travel", label: "Travel" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "other", label: "Other" },
];

const CategoryDropdown = ({ value, onChange, type }: CategoryDropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(null);

  const availableCategories = type === "income" ? incomeCategories : expenseCategories;

  React.useEffect(() => {
    if (value === "") {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(availableCategories.find((status) => status.value === value) || null);
    }
  }, [value, type]);

  return (
    <div className="flex items-center space-x-4 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-center">
            {selectedStatus ? selectedStatus.label : "Select category"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-50 p-0">
          <Command>
            <CommandInput placeholder="Select category..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {availableCategories.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      onChange(value);
                      setSelectedStatus(
                        availableCategories.find((item) => item.value === value) || null
                      );
                      setOpen(false);
                    }}
                  >
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CategoryDropdown;
