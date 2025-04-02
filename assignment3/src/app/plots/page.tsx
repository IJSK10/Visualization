"use client";
import MDSDataChart from "@/components/MDSDataChart";
import MDSVariablesChart from "@/components/MDSVariablesChart";
import PCPPlot from "@/components/PCPPlot";
import MSEPlot from "@/components/MSEPlot"
import { useState } from "react";

export default function Home() {
  const [order, setOrder] = useState([
    "Year", "Metascore", "Userscore", "User_Count", "Rank", "Positive %", "Mixed %", "Negative %", 
    "NA_Sales", "Global_Sales", "Month", "Developer", "Publisher", "Userscore Status", 
     "Genre","Rating", "Meta Status"
  ]);
  const [k,setK] = useState(3);
  const [mdsorder,setMdsorder] = useState([]);

  const handleOrder = (value: []) => {
    setOrder(value);
    console.log(order);
  };

  const handleMDSorder = (value: []) => {
    setMdsorder(value);
  };
  const handleK = async (value : number) => {
    try {
      const response = await fetch("http://127.0.0.1:5001/set_k", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ k: value }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update k value");
      }
  
      const data = await response.json();
      console.log("Updated k:", data.new_k);
      setK(data.new_k);
      setTimeout(function() {
      }, 5000)
      console.log(k);
    } catch (error) {
      console.error("Error updating k value:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center py-10 space-y-8 text-black">
      <h1 className="text-2xl font-bold text-black">Data Visualization Dashboard</h1>
  
      <div className="border-2 border-gray-300 rounded-lg p-4 shadow-md">
        <MSEPlot kValue={k} onKChange={handleK}/>
      </div>
  
      <div className="border-2 border-gray-300 rounded-lg p-4 shadow-md">
        <MDSDataChart k={k}/>
      </div>
  
      <div className="border-2 border-gray-300 rounded-lg p-4 shadow-md">
        <MDSVariablesChart order={order} mdsOrder={mdsorder} setOrder={handleOrder} setMdsOrder={handleMDSorder}/>
      </div>
  
      <div className="border-2 border-gray-300 rounded-lg p-4 shadow-md">
        <PCPPlot order={order} mdsOrder={mdsorder} setOrder={handleOrder} k={k}/>
      </div>
    </div>
  );
  
}
