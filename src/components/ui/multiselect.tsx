import React, { useState } from "react";
import Select from "react-select";

function  SortableMultiSelect(
  { onChange, value, options, disabled = false }: {
    onChange: (value: string[]) => void
    value: string[],
    options: string[],
    disabled?: boolean
  }
) {
  return (
    <Select
      isMulti
      required
      options={options.map(
        (col) => ({ value: col, label: col })
      )}
      value={
        value.map((col) => ({ value: col, label: col }))
      }
      onChange={
        (value) => onChange(value.map((v) => v.value))
      }
      closeMenuOnSelect={false}
      isDisabled = {disabled}
    />
  );
};

export default SortableMultiSelect;
