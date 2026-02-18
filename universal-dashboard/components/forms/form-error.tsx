import React from "react";

export interface FormErrorProps {
  message?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;
  return (
    <p className="mt-0.5 text-caption text-rose-600" role="alert">
      {message}
    </p>
  );
};

