"use client"
import { useEffect, useState } from "react";
import { fetchKMeansData} from "../utils/api";
import ScreePlot from "../components/ScreePlot";
import Biplot from "../components/Biplot";
import ScatterPlot from "../components/ScatterPlot";
import MSEPlot from "../components/MSEPlot";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columns, setColumns] = useState([]);
  const [dimensionality, setDimensionality] = useState<number>(2);
  const [kValue,setKValue]=useState<number>(2);

  useEffect(() => {
    fetchKMeansData().then((res) => {
      setColumns(res.columns);
      setDimensionality(res.optimal_k);
      setKValue(res.optimal_k);
    });
  }, []);

  const handleChangeDimensionalty = (value: number) => {
    setDimensionality(value);
  };

  const handleChangeKValue = (value : number) => {
    setKValue(value);
    console.log("changed ka value");
    console.log(kValue);
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 text-black bg-white">
      <div className="border p-4 flex flex-col items-center justify-center h-[450px]">
        <h2 className="text-xl font-bold">PCA Scree Plot</h2>
        <ScreePlot dimensionality={dimensionality} setDimensionality={handleChangeDimensionalty} />
      </div>
       <div className="border p-4 flex flex-col items-center justify-center h-[450px]">
        <h2 className="text-xl font-bold">PCA Biplot</h2>
        <Biplot dimensionality={dimensionality} kValue={kValue}/>
      </div>
      <div className="border p-4 flex flex-col items-center justify-center h-[800px]">
        <h2 className="text-xl font-bold">Scatter Plot</h2>
        <ScatterPlot dimensionality={dimensionality} />
      </div>
      <div className="border p-4 flex flex-col items-center justify-center h-[800px]">
        <h2 className="text-xl font-bold">K-Means MSE Plot</h2>
        <MSEPlot kValue={kValue} onKChange={handleChangeKValue}/>
      </div>
    </div>
  );
}