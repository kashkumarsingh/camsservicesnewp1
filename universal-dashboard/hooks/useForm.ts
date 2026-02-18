import React from "react";

export interface UseFormOptions<TValues> {
  initialValues: TValues;
}

export const useForm = <TValues extends Record<string, unknown>>({
  initialValues,
}: UseFormOptions<TValues>) => {
  const [values, setValues] = React.useState<TValues>(initialValues);

  const updateField = <K extends keyof TValues>(key: K, value: TValues[K]) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const reset = () => setValues(initialValues);

  return {
    values,
    updateField,
    reset,
  };
};

