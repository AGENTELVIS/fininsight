import React, { forwardRef } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type IntervalDropdownProps = {
  value?: string;
  onChange: (value: string) => void;
};

const IntervalDropdown = forwardRef<HTMLButtonElement, IntervalDropdownProps>(
  ({ value, onChange }, ref) => {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger ref={ref}>
          <SelectValue placeholder="Select Interval" />
        </SelectTrigger>
        <SelectContent className="z-[100]">
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>
    );
  }
);

export default IntervalDropdown;
