"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function SideBar() {
    const router = useRouter();
    return (
        <div className="fixed left-0 top-0 h-full w-40 bg-gray-800 flex flex-col items-center rounded-r-lg overflow-y-auto" >
            <p className="text-white mt-5 text-lg font-semibold">Visualization</p>
            <div className="flex flex-col justify-center items-center h-full gap-4 p-4">
                <button className="p-2 bg-blue-400 text-white w-36 rounded-full hover:bg-blue-700 transition flex flex-col items-center gap-2" onClick={() => router.push('/')}>
                    <div className="flex flex-row">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chart-bar-popular"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M9 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M4 20h14" /></svg>
                        <span>Main Page</span>
                    </div>
                </button>
                <button className="p-2 bg-blue-400 text-white w-36 rounded-full hover:bg-blue-700 transition" onClick={() => router.push('/plots')}>
                <div className="flex flex-row justify-center">
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-chart-scatter"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18" /><path d="M8 15.015v.015" /><path d="M16 16.015v.015" /><path d="M8 7.03v.015" /><path d="M12 11.03v.015" /><path d="M19 11.03v.015" /></svg>
                    Plots
                    </div>
                    </button>
                
            </div>
        </div>
    )
}