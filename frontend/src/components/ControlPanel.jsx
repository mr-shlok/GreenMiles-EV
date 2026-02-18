import { useState } from "react";
import { predictBattery } from "../services/api";

const ControlPanel = () => {

    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

  const [form, setForm] = useState({
    Internal_Resistance_Ohm: 0.05,
    Total_Charging_Cycles: 200,
    Battery_Capacity_kWh: 60,
    Fast_Charge_Ratio: 0.3,
    Avg_Temperature_C: 30,
    Vehicle_Age_Months: 24,
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSubmit = async () => {
    try {
      const res = await predictBattery(form);
      setResult(res.data.predicted_soh_percent);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full bg-[#08090A] text-white p-6 flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#69E300]">
        EV Optimization Panel
      </h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          type="number"
          value={form[key]}
          onChange={handleChange}
          className="bg-black border border-[#69E300] p-2 rounded-md focus:outline-none"
        />
      ))}

      <button
        onClick={handleSubmit}
        className="bg-[#69E300] text-black font-bold py-2 rounded-md hover:opacity-80 transition"
      >
        Predict Battery Health
      </button>

      {result && (
        <div className="mt-4 text-lg">
          Predicted SoH:{" "}
          <span className="text-[#69E300] font-bold">{result}%</span>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
