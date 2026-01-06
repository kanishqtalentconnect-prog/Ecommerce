import { useState } from "react";
import axiosInstance from "../lib/axios";


const AddressForm = ({ initialData, onClose, onSaved }) => {
  const [form, setForm] = useState(
    initialData || {
      fullName: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
      phone: "",
    }
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (initialData?._id) {
      await axiosInstance.put(
        `/api/address/${initialData._id}`,
        form,
        { withCredentials: true }
      );
    } else {
      await axiosInstance.post(
        "/api/address",
        form,
        { withCredentials: true }
      );
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-md space-y-3"
      >
        <h3 className="text-lg font-semibold">
          {initialData ? "Edit Address" : "Add New Address"}
        </h3>

        {["fullName", "street", "city", "state", "zipcode", "country", "phone"].map((f) => (
          <input
            key={f}
            name={f}
            value={form[f]}
            onChange={handleChange}
            placeholder={f}
            required
            className="w-full border p-2 rounded"
          />
        ))}

        <div className="flex justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="text-gray-600">
            Cancel
          </button>
          <button className="bg-amber-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
export default AddressForm;