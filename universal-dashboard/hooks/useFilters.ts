import React from "react";

export const useFilters = <TValues extends Record<string, string>>(
  initialValues: TValues,
) => {
  const [values, setValues] = React.useState<TValues>(initialValues);

  const setFilter = (id: keyof TValues & string, value: string) => {
    setValues((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const clearAll = () => {
    setValues(initialValues);
  };

  return {
    values,
    setFilter,
    clearAll,
  };
};

