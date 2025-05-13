import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { useDebounce } from "use-debounce";

interface SearchProps {
  onSearch: (search: string) => void;
}

export default function SearchFilterSort({ onSearch }: SearchProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const isRequestPending = useRef(false); // Track ongoing requests

  useEffect(() => {
    if (isRequestPending.current) return; // Skip if a request is already pending

    isRequestPending.current = true; // Mark request as pending
    onSearch(debouncedSearch);

    // Cleanup to reset pending status
    return () => {
      isRequestPending.current = false;
    };
  }, [debouncedSearch, onSearch]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
