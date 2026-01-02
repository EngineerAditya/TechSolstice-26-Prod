"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

// --- Context ---
interface SelectContextValue {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

// --- Root Component ---
export const Select = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
      <div className="relative inline-block w-full text-left">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// --- Trigger (The Button) ---
export const SelectTrigger = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`
        flex h-10 w-full items-center justify-between rounded-md border border-white/10 
        bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-400 
        focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

// --- Value (The Text displayed in the button) ---
export const SelectValue = ({ placeholder }: { placeholder: string }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  // If value is empty, show placeholder. 
  // Note: This simple implementation shows the raw value. 
  // For proper labels, standard Selects usually map values to labels. 
  // Since we are using simple string values in your app (like "Flagship"), this works fine.
  return (
    <span className="block truncate">
      {context.value || placeholder}
    </span>
  );
};

// --- Content (The Dropdown Body) ---
export const SelectContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

  if (!context.open) return null;

  return (
    <>
      {/* Backdrop to close on click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => context.setOpen(false)}
      />

      {/* Dropdown List */}
      <div className={`
        absolute right-0 z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-auto 
        rounded-md border border-white/10 bg-[#111] text-white shadow-xl animate-in fade-in zoom-in-95 duration-100
        ${className}
      `}>
        <div className="p-1">{children}</div>
      </div>
    </>
  );
};

// --- Item (The Options) ---
export const SelectItem = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const isSelected = context.value === value;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        context.onChange(value);
        context.setOpen(false);
      }}
      className={`
        relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none 
        hover:bg-white/10 hover:text-cyan-400
        ${isSelected ? "text-cyan-400 bg-cyan-500/10" : "text-white"}
      `}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span>{children}</span>
    </div>
  );
};