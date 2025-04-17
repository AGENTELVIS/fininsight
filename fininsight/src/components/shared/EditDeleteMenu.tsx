import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSubTrigger,
    MenubarTrigger,
  } from "@/components/ui/menubar"  
import { Ellipsis } from "lucide-react"
import DeleteDialog from "./DeleteDialog"
import { Models } from "appwrite";
import { useState } from "react";
import AccountDrawer from "./AccountDrawer";

type EditDeleteMenuProps = {
  account:Models.Document;
}

const EditDeleteMenu = ({account}: EditDeleteMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger className="outline-none border-none">
                  <Ellipsis className="outline-none border-none"/>
                </MenubarTrigger>
                <MenubarContent>
                <MenubarItem onClick={() => setIsOpen(true)}>
                    Edit 
                </MenubarItem>
                <MenubarSeparator />
                <MenubarTrigger className="text-destructive">
                  <DeleteDialog accountId={account.$id} onDelete={(id) => {
                    setIsOpen(false);
                  }}/>
                </MenubarTrigger>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
      <AccountDrawer account={account} isOpen={isOpen} setIsOpen={setIsOpen}/>
    </div>
  )
}

export default EditDeleteMenu