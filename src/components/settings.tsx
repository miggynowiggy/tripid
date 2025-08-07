"use client"

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@radix-ui/react-popover";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

function Settings() {
    const [showClearStorageDialog, setShowClearStorageDialog] = useState(false);
    const { toast } = useToast()

    const handleClearStorage = () => {
        localStorage.clear();
        setShowClearStorageDialog(false);
        toast({
            title: "Data cleared!",
            description: "All your trip data has been deleted.",
            variant: "default",
        })
    }

    return (
        <>
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <Popover open={showClearStorageDialog} onOpenChange={setShowClearStorageDialog}>
                <PopoverTrigger asChild>
                    <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" /> Clear All Data</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white rounded-md p-4 shadow-md">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Are you absolutely sure?</h4>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone. This will permanently delete all your stored trip data from this device.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2"><PopoverClose asChild><Button variant="outline">Cancel</Button></PopoverClose><Button variant="destructive" onClick={handleClearStorage}>Continue</Button></div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
}

export default Settings;