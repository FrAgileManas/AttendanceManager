"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", className }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-white border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-md z-50" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="bg-white"
        />
      </PopoverContent>
    </Popover>
  )
}