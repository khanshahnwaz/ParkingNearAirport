"use client";
import { useState } from "react";

export default function SelectBox({ options, placeholder, onChange,style }) {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    console.log(e.target.value)
    const v=e.target.value;
    setSelected(e.target.value);
    // Guard the call so we don't crash if onChange isn't provided
    if (typeof onChange === "function") {
      onChange(v);
    }
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      className={`${style} text-gray-700 flex-1 px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-400 w-full `}
    >
      <option className="px-4 py-2 h4" value="">{placeholder || "Select option"}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
