import { Input } from "@/components/ui/input";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import {
  HTMLProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ClassNameValue } from "tailwind-merge";

interface DropdownItem {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface InputWithDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: DropdownItem) => void;
  items: DropdownItem[];
  placeholder?: string;
  description?: string;
  className?: string;
  inputClassName?: HTMLProps<HTMLInputElement>["className"];
  dropdownClassName?: HTMLProps<HTMLDivElement>["className"];
  disabled?: boolean;
  allowCustomValue?: boolean;
  inputIcon?: React.ReactNode;
  emptyMessage?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  renderItem?: (item: DropdownItem, isSelected: boolean) => React.ReactNode;
  filterFunction?: (
    items: DropdownItem[],
    searchTerm: string,
  ) => DropdownItem[];
}

export const InputWithDropdown = ({
  value,
  onChange,
  onSelect,
  items,
  placeholder = "Type or select...",
  description,
  className,
  inputClassName,
  dropdownClassName,
  disabled = false,
  allowCustomValue = true,
  inputIcon,
  emptyMessage = "No items found",
  onKeyDown,
  onFocus,
  onBlur,
  renderItem,
  filterFunction,
}: InputWithDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default filter function
  const defaultFilterFunction = (items: DropdownItem[], searchTerm: string) => {
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  };

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    const filterFunc = filterFunction || defaultFilterFunction;
    return filterFunc(items, value);
  }, [items, value, filterFunction]);

  // Check if current value exactly matches any item
  const exactMatch = items.find(
    (item) => item.value === value || item.label === value,
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle item selection
  const handleItemSelect = (item: DropdownItem) => {
    if (item.disabled) return;

    onChange(item.value);
    onSelect?.(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1,
        );
        break;

      case "Enter":
        e.preventDefault();
        if (
          isOpen &&
          highlightedIndex >= 0 &&
          filteredItems[highlightedIndex]
        ) {
          handleItemSelect(filteredItems[highlightedIndex]);
        } else if (allowCustomValue) {
          setIsOpen(false);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case "Tab":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }

    onKeyDown?.(e);
  };

  // Handle focus
  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    // Delay to allow item selection
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
    onBlur?.();
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    if (disabled) return;

    if (isOpen) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Default item renderer
  const defaultRenderItem = (item: DropdownItem, isHighlighted: boolean) => (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors",
        isHighlighted && "bg-accent text-accent-foreground",
        item.disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.label}</div>
        {item.description && (
          <div className="text-xs text-muted-foreground truncate">
            {item.description}
          </div>
        )}
      </div>
      {exactMatch?.value === item.value && (
        <Check className="w-4 h-4 text-primary" />
      )}
    </div>
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        {/* Input */}
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("pr-8 text-sm", inputIcon && "pl-8", inputClassName)}
          />

          {inputIcon && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              {inputIcon}
            </div>
          )}

          {/* Clear button */}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-sm transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}

          {/* Dropdown toggle */}
          <button
            type="button"
            onClick={toggleDropdown}
            disabled={disabled}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-sm transition-colors",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden",
              dropdownClassName,
            )}
          >
            <div className="overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <div
                    key={`${item.value}-${index}`}
                    onClick={() => handleItemSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {renderItem
                      ? renderItem(item, index === highlightedIndex)
                      : defaultRenderItem(item, index === highlightedIndex)}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                  {emptyMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
