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
};
  

const DatePicker = ({ value, onChange }: DatePickerProps) => {

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon />
                    {value ? format(value, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    initialFocus
                    className=" rounded-xl"
                    />
                </PopoverContent>
    </Popover>
    </div>
  )
}

export default DatePicker