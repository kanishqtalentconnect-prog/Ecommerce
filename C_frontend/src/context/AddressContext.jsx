import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../lib/axios";

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDefaultAddress = async () => {
    try {
      const res = await axiosInstance.get("/api/address/default", {
        withCredentials: true,
      });
      setDefaultAddress(res.data);
    } catch {
      setDefaultAddress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultAddress();
  }, []);

  return (
    <AddressContext.Provider
      value={{
        defaultAddress,
        setDefaultAddress,
        fetchDefaultAddress,
        loading,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
