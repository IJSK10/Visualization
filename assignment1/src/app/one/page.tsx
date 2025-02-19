'use client';
import React,{useState,useEffect} from "react";
import * as d3 from 'd3';
import { SideBar } from "@/components/SideBar";
import { Dropdown } from "@/components/Dropdown";
import { Histogram } from "@/components/Histogram";
import { BarPlot } from "@/components/Barplot";
import ToggleSwitch from "@/components/ToggleSwitch";
import { columnTypeMap } from "@/constants/column";


const OnePage = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data,setData] = useState<any[]>([]);
    const [column,setColumn]=useState<string>('');
    const [selectedGraph,setSelectedGraph]=useState<'Histogram'|'Barplot'>('Histogram');
    const [isToggled, setIsToggled] = useState<boolean>(false);
    const [isSort, setIsSort] = useState<boolean>(false);

    useEffect(()=>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.csv('/data/games.csv').then((data: React.SetStateAction<any[]>)=>{
            setData(data);
        });
    },[]);

    const handleColumnChange = (value:string)=>{
        setColumn(value);
        setSelectedGraph(columnTypeMap[value] ? "Barplot" : "Histogram");

    };


    const handleToggleChange = (checked: boolean) => {
        console.log(checked);
        setIsToggled(checked);
      };

      const handleSortChange = (checked: boolean) => {
        console.log(checked);
        setIsSort(checked);
      }; 

    const columns=data[0] ? Object.keys(data[0]) : [];

    return (
        <div className="flex">
            <SideBar />
            <div className="ml-40 p-6 w-full">
                <div className="flex items-center space-x-6">
                    <div className="flex flex-col space-y-10">
                    <h1 className="text-2xl font-bold mb-4">{selectedGraph}</h1>
                    <Dropdown options={columns} selectedValue={column} onChange={handleColumnChange} />

                    <div className="flex flex-col space-y-2">
                        <ToggleSwitch checked={isToggled} onChange={handleToggleChange} text="Change x and y axis"/>
                    </div>

                    {selectedGraph==='Barplot' && <div className="flex flex-col space-y-2">
                        <ToggleSwitch checked={isSort} onChange={handleSortChange} text="Sort the data"/>
                    </div>}
                    
                    </div>

                    <p className="text-lg font-semibold">{selectedGraph === 'Histogram' ? <Histogram data={data} column={column} checked={isToggled} /> : <BarPlot data={data} column={column} checked={isToggled} sortData={isSort}/>}</p>
                </div>
            </div>
        </div>
    )
}

export default OnePage;