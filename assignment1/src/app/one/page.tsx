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
    //const [columns,setColumns]= useState([]);
    const [column,setColumn]=useState<string>('');
    const [selectedGraph,setSelectedGraph]=useState<'histogram'|'barplot'>('histogram');
    const [isToggled, setIsToggled] = useState<boolean>(false);

    useEffect(()=>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.csv('/data/games.csv').then((data: React.SetStateAction<any[]>)=>{
            setData(data);
        });
    },[]);

    const handleColumnChange = (value:string)=>{
        setColumn(value);
        setSelectedGraph(columnTypeMap[value] ? "barplot" : "histogram");

    };


    const handleToggleChange = (checked: boolean) => {
        console.log(checked);
        setIsToggled(checked);
      };

    const columns=data[0] ? Object.keys(data[0]) : [];

    return (
        <div className="flex">
            <SideBar />
            <div className="ml-64 p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">One Page</h1>
                
                {/* Horizontal Layout */}
                <div className="flex items-center space-x-6">
                    {/* Dropdown */}
                    <Dropdown options={columns} selectedValue={column} onChange={handleColumnChange} />

                    {/* Buttons (Stacked Vertically) */}
                    <div className="flex flex-col space-y-2">
                        <ToggleSwitch checked={isToggled} onChange={handleToggleChange} />
                    </div>

                    {/* Selected Graph Label */}
                    <p className="text-lg font-semibold">{selectedGraph === 'histogram' ? <Histogram data={data} column={column} checked={isToggled} /> : <BarPlot data={data} column={column} checked={isToggled}/>}</p>
                </div>
            </div>
        </div>
    )
}

export default OnePage;