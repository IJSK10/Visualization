'use client';
import React,{useState,useEffect} from "react";
import * as d3 from 'd3';
import { SideBar } from "@/components/SideBar";
import { Dropdown } from "@/components/Dropdown";


const TwoPage = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data,setData] = useState<any[]>([]);
    //const [columns,setColumns]= useState([]);
    const [column,setColumn]=useState<string>('');
    const [selectedGraph,setSelectedGraph]=useState<'histogram'|'barplot'>('histogram');

    useEffect(()=>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.csv('/data/video_games.csv').then((data: React.SetStateAction<any[]>)=>{
            setData(data);
        });
    },[]);

    const handleColumnChange = (value:string)=>{
        setColumn(value);
    };

    const handleGraphChange = (graph : 'histogram' | 'barplot') => {
        setSelectedGraph(graph);
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
                        <button className="p-2 bg-blue-500 text-white rounded" onClick={() => handleGraphChange('histogram')}>
                            Histogram
                        </button>
                        <button className="p-2 bg-blue-500 text-white rounded" onClick={() => handleGraphChange('barplot')}>
                            Barplot
                        </button>
                    </div>

                    {/* Selected Graph Label */}
                    <p className="text-lg font-semibold">{selectedGraph === 'histogram' ? 'Histogram' : 'BarPlot'}</p>
                </div>
            </div>
        </div>
    )
}

export default TwoPage;