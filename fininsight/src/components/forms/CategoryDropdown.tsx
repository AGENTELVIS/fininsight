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
};

type Status = {
    value: string
    label: string

  }
   
  const statuses: Status[] = [
    {
      value: "shopping",
      label: "Shopping",
    },
    {
      value: "food",
      label: "Food",
    },
    {
      value: "home",
      label: "Home",
    },
    {
      value: "entertainment",
      label: "Entertainment",
    },
    {
      value: "bills",
      label: "Bills",
    },
    {
      value: "other",
      label: "Other",
    },
]

const CategoryDropdown = ({ value, onChange} : CategoryDropdownProps) => {

    const [open, setOpen] = React.useState(false)
    const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null )

    React.useEffect(() => {
      if (value === "") {
        setSelectedStatus(null);
      } else {
        setSelectedStatus(statuses.find((status) => status.value === value) || null);
      }
    }, [value]);

    return(
        <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-center">
            {selectedStatus ? <>{selectedStatus.label}</> : <>select category</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="select category..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      onChange(value);
                      setSelectedStatus(
                        statuses.find((priority) => priority.value === value) ||
                          null
                      )
                      setOpen(false)
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
    )
}

export default CategoryDropdown;