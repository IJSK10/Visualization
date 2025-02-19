'use client';
import React, { useState, useEffect } from "react";
import * as d3 from 'd3';
import { SideBar } from "@/components/SideBar";
import RadioButton from "@/components/Radiobutton";
import { ScatterPlot } from "@/components/Scatterplot";


const TwoPage = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    const [column1, setColumn1] = useState<string>('');
    const [column2, setColumn2] = useState<string>('');

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.csv('/data/games.csv').then((data: React.SetStateAction<any[]>) => {
            setData(data);
        });
    }, []);

    const handleColumn1Change = (value: string) => {
        setColumn1(value);
    };

    const handleColumn2Change = (value: string) => {
        setColumn2(value);
    }

    const columns = data[0] ? Object.keys(data[0]) : [];

    return (
        <div className="flex">
            <SideBar />
            <div className="ml-40 p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">Scatter Plot</h1>

                <div className="flex items-center space-x-6">
                    <div className="p-6 bg-white shadow-md rounded-md">
                        <h2 className="text-lg font-semibold mb-4">Select an Option:</h2>
                        <div className="flex space-x-8">
                        <div className="flex flex-col space-y-3">
                            <div>X_AXIS</div>
                            <RadioButton columns={columns} selectedValue={column1} onChange={handleColumn1Change} />
                            </div>
                            <div className="flex flex-col space-y-3">
                                <div>Y_AXIS</div>
                            <RadioButton columns={columns} selectedValue={column2} onChange={handleColumn2Change} />
                            </div>
                            <ScatterPlot data={data} xColumn={column1} yColumn={column2} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TwoPage;