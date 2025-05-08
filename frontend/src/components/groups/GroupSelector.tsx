"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";
import type { Group } from "../../types/group.types";

interface GroupSelectorProps {
  groups: Group[];
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
}

export default function GroupSelector({
  groups,
  selectedGroup,
  onGroupChange,
}: GroupSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          {selectedGroup
            ? groups.find((group) => group._id === selectedGroup)?.name ||
              "Select group"
            : "All groups"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search group..." />
          <CommandList>
            <CommandEmpty>No group found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onGroupChange("");
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !selectedGroup ? "opacity-100" : "opacity-0"
                  )}
                />
                All groups
              </CommandItem>
              {groups.map((group) => (
                <CommandItem
                  key={group._id}
                  onSelect={() => {
                    onGroupChange(group._id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedGroup === group._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {group.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
