"use client";
import { useState } from "react";

export default function SelectBox({ options, placeholder, onChange }) {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    console.log(e.target.value)
    setSelected(e.target.value);
     onChange(e.target.value);
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      className=" text-gray-700 flex-1 px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">{placeholder || "Select option"}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
