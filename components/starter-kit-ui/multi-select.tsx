"use client"
import { ChevronDown, X } from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface MultiSelectProps {
    options?: string[]
    placeholder?: string
    label?: string
    className?: string
    optionsDropdownWidth?: number
    optionsDropdownClassName?: string
    variant?: "default" | "outline" | "secondary"
    size?: "sm" | "default" | "lg"
    value?: string[] // Controlled value
    onChange?: (selectedOptions: string[]) => void // Callback when selection changes
}

const MultiSelect = ({
    options = ["Apple", "Banana", "Guava", "Oranges"],
    placeholder = "Select options",
    label = "Select options",
    className,
    optionsDropdownWidth,
    optionsDropdownClassName,
    variant = "default",
    size = "default",
    value,
    onChange,
}: MultiSelectProps) => {
    const [open, setOpen] = useState<boolean>(false)
    const [disableTrigger, setDisableTrigger] = useState<boolean>(false)
    const [selectedOptions, setSelectedOptions] = useState<string[]>(value || [])
    const triggerRef = useRef<HTMLDivElement>(null)
    const [triggerWidth, setTriggerWidth] = useState<number>(0)

    // Update internal state when value prop changes (controlled component)
    useEffect(() => {
        if (value !== undefined) {
            setSelectedOptions(value)
        }
    }, [value])

    // Update trigger width when component mounts or resizes
    useEffect(() => {
        const updateWidth = () => {
            if (triggerRef.current) {
                setTriggerWidth(triggerRef.current.offsetWidth)
            }
        }

        updateWidth()
        window.addEventListener('resize', updateWidth)
        
        return () => {
            window.removeEventListener('resize', updateWidth)
        }
    }, [])

    const handleOptionToggle = (option: string) => {
        const newSelectedOptions = selectedOptions.includes(option)
            ? selectedOptions.filter(item => item !== option)
            : [option, ...selectedOptions]
        
        setSelectedOptions(newSelectedOptions)
        onChange?.(newSelectedOptions) // Call onChange callback
    }

    const removeOption = (option: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newSelectedOptions = selectedOptions.filter(item => item !== option)
        setSelectedOptions(newSelectedOptions)
        onChange?.(newSelectedOptions) // Call onChange callback
    }

    const displayValue = selectedOptions.length > 0
        ? `${selectedOptions.length} selected`
        : ""

    // Size variants
    const sizeClasses = {
        sm: "h-8 text-sm py-1",
        default: "h-10 py-2",
        lg: "h-12 text-lg py-3",
    }

    // Variant classes
    const variantClasses = {
        default: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "border border-border bg-secondary hover:bg-secondary/80",
    }

    // Badge size variants
    const badgeSizeClasses = {
        sm: "text-xs px-1.5 h-5",
        default: "text-sm px-2 h-6",
        lg: "text-base px-2.5 h-7",
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <div className={cn("flex flex-col gap-2 w-full", className)}>
                <p className="w-full flex items-center justify-between px-3.5">
                    <span>{label}</span> 
                    <span>{displayValue}</span>
                </p>
                <DropdownMenuTrigger asChild disabled={disableTrigger}>
                    <div
                        ref={triggerRef}
                        className={cn(
                            "relative cursor-pointer rounded-md border border-input bg-background transition-colors",
                            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden",
                            "rounded-full",
                            sizeClasses[size],
                            variantClasses[variant],
                            "w-full" // Ensure full width
                        )}
                    >
                        <Input
                            readOnly
                            placeholder={
                                selectedOptions.length === 0 ? placeholder : ""
                            }
                            onClick={() => setOpen(!open)
                            }
                            className={cn(
                                "h-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-muted-foreground text-foreground cursor-pointer pr-10",
                                "bg-transparent w-full"
                            )}
                        />
                        <ChevronDown className={cn(
                            "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
                            {
                                "h-3 w-3": size === "sm",
                                "h-4 w-4": size === "default",
                                "h-5 w-5": size === "lg",
                            }
                        )} />

                        {/* Selected options as badges */}
                        {selectedOptions.length > 0 && (
                            <div className={cn(
                                "absolute left-3 top-1/2 transform -translate-y-1/2 flex gap-1 overflow-y-hidden overflow-x-auto w-full scrollbar-hide",
                                {
                                    "max-w-[88%]": size === "lg",
                                    "max-w-[89%]": size === "default",
                                    "max-w-[90%]": size === "sm",
                                }
                            )}
                            >
                                {selectedOptions.map((option) => (
                                    <Badge
                                        key={option}
                                        variant="default"
                                        className={cn(
                                            "flex items-center gap-1 pr-1 max-w-max truncate rounded-full mr-0.5",
                                            badgeSizeClasses[size]
                                        )}
                                    >
                                        <span className="truncate">{option}</span>
                                        <Button
                                            size="icon-sm"
                                            onClick={(e) => removeOption(option, e)}
                                            onMouseOver={()=>setDisableTrigger(true)}
                                            onMouseLeave={()=>setDisableTrigger(false)}
                                            className={cn(
                                                {
                                                    "p-0.5": size === "sm",
                                                    "p-1": size === "default" || size === "lg",
                                                }
                                            )}
                                        >
                                            <X className={cn({
                                                "h-2.5 w-2.5": size === "sm",
                                                "h-3 w-3": size === "default",
                                                "h-3.5 w-3.5": size === "lg",
                                            })} />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className={cn("w-full", optionsDropdownClassName)}
                    style={{ 
                        width: optionsDropdownWidth 
                            ? `${optionsDropdownWidth}px` 
                            : `${triggerWidth}px` // Use trigger width as default
                    }}
                    align="start"
                >
                    <DropdownMenuLabel>{label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-60 overflow-auto">
                        {options.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option}
                                checked={selectedOptions.includes(option)}
                                onCheckedChange={() => handleOptionToggle(option)}
                                onSelect={(e) => e.preventDefault()}
                                className={cn({
                                    "text-sm": size === "sm",
                                    "text-base": size === "lg",
                                })}
                            >
                                {option}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </div>
        </DropdownMenu>
    )
}

export default MultiSelect