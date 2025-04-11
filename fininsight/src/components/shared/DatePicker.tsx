import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import React from "react"

type DatePickerProps = {
  value?: Date;
  onChange?: (date?: Date) => void;
  minDate?: Date;
};

const DatePicker = ({ value, onChange, minDate }: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (onChange) {
              onChange(date);
              setOpen(false);
            }
          }}
          disabled={(date) => minDate ? date < minDate : false}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;