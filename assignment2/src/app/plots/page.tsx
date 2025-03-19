"use client"
import { useEffect, useState } from "react";
import { fetchKMeansData} from "@/utils/api";
import ScreePlot from "@/components/ScreePlot";
import Biplot from "@/components/Biplot";
import ScatterPlot from "@/components/ScatterPlot";
import MSEPlot from "@/components/MSEPlot";
import SideBar from "@/components/SideBar";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columns, setColumns] = useState([]);
  const [dimensionality, setDimensionality] = useState<number>(4);
  const [kValue,setKValue]=useState<number>(4);
  const [component1,setComponent1]=useState<number>(0);
  const [component2,setComponent2]=useState<number>(1);
  const [changecomp1,setChangeComp1]=useState<boolean>(true);

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


  const handleChangeComponent = (value : number) => {
    if (changecomp1)
    {
      setComponent1(value);
    }
    else
    {
      setComponent2(value);
    }
  }
  
  const handleChangeComp1 =(value : boolean) =>{
    setChangeComp1(value);
  }

  const handleChangeKValue = (value : number) => {
    setKValue(value);
  }

  return (
    <div>
      <SideBar/>
    <div className="flex flex-col m-3 ml-44 p-4 text-black bg-white">
     
      <div className=" border m-4 p-4 flex flex-col items-center justify-center h-[450px]">
        <h2 className="text-xl font-bold pb-4">PCA Scree Plot</h2>
        <ScreePlot dimensionality={dimensionality} setDimensionality={handleChangeDimensionalty} component1={component1} component2={component2} changeComponent={handleChangeComponent} changeComp={handleChangeComp1} compbool={changecomp1}/>
      </div>
        <div className="border m-4 p-4 flex flex-col items-center justify-center h-[500px]">
        <h2 className="text-xl font-bold pb-4">PCA Biplot</h2>
        <Biplot dimensionality={dimensionality} kValue={kValue} comp1={component1} comp2={component2}/>
      </div>
      <div className="border m-4 p-4 flex flex-col items-center justify-center h-[1100px]">
        <h2 className="text-xl font-bold pb-4">Scatter Plot</h2>
        <ScatterPlot dimensionality={dimensionality} component1={component1} component2={component2} k={kValue} />
      </div>
      
      <div className="border m-4 p-4 flex flex-col items-center justify-center h-[500px]">
        <h2 className="text-xl font-bold">K-Means MSE Plot</h2>
        <MSEPlot kValue={kValue} onKChange={handleChangeKValue}/>
      </div>
    </div>
    </div>
  );
}