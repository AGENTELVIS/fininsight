
import { Button } from '../ui/button';

type TypeToggleProps = {
    value: "income" | "expense";
    onChange: (type: "income" | "expense") => void;
  };

const TypeToggle = ({value, onChange}: TypeToggleProps) => {

  return (
    <div className="flex gap-4">
          <Button 
            type="button"
            className={`px-4 py-2 rounded-md ${value === "expense" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => { onChange("expense");
              
            }}
          >
            Expense
          </Button>
          <Button 
            type="button"
            className={`px-4 py-2 rounded-md ${value === "income" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => { onChange("income");
              
            }}
          >
            Income
          </Button>
        </div>
  )
}

export default TypeToggle