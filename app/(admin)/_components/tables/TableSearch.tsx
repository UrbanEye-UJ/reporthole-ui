"use client";

import SearchField from "../ui/SearchField";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TableSearch = ({
  value,
  onChange,
  placeholder = "Search records...",
}: TableSearchProps) => {
  return (
    <SearchField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      width={300}
    />
  );
};

export default TableSearch;
