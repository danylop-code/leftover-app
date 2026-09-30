import { createContext, useContext } from 'react';

type FieldContextValue = { label?: string; invalid: boolean };

export const FieldContext = createContext<FieldContextValue>({ invalid: false });

export const useFieldContext = () => useContext(FieldContext);
