import { Button } from '../ui/button';

type TypeToggleProps = {
    value: "income" | "expense";
    onChange: (type: "income" | "expense") => void;
    className?: string;
};

const TypeToggle = ({value, onChange, className}: TypeToggleProps) => {
  return (
    <div className={`flex w-full gap-2 ${className}`}>
      <Button 
        type="button"
        className={`flex-1 py-2 rounded-lg transition-colors duration-200 ${
          value === "expense" 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
        onClick={() => onChange("expense")}
      >
        Expense
      </Button>
      <Button 
        type="button"
        className={`flex-1 py-2 rounded-lg transition-colors duration-200 ${
          value === "income" 
            ? "bg-green-500 text-white hover:bg-green-600" 
            : "bg-white text-gray-500 hover:bg-gray-100"
        }`}
        onClick={() => onChange("income")}
      >
        Income
      </Button>
    </div>
  )
}

export default TypeToggle