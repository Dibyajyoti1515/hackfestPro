import { createContext, useState } from "react";
export const AppContext = createContext();
export function AppProvider({ children }) {
  const [formData, setFormData] = useState({
    instagram: "",
    twitter: ""
  });
  const [gifts, setGifts] = useState([]);
  const [progress, setProgress] = useState("");
  return (
    <AppContext.Provider
      value={{
        formData,
        setFormData,
        gifts,
        setGifts,
        progress,
        setProgress
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

