"use client";
import React from "react";
import { useRouter } from "next/navigation";

export const SideBar: React.FC = () => {
    const router = useRouter();
    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 flex flex-col items-center rounded-r-lg overflow-y-auto" >
            <p className="text-white mt-5 text-lg font-semibold">Navigation</p>
            <div className="flex flex-col justify-center items-center h-full gap-4 p-4">
            <button className="p-2 bg-blue-400 text-white w-44 rounded-full hover:bg-blue-700 transition" onClick={() => router.push('/one')}>Go to Page One</button>
            <button className="p-2 bg-blue-400 text-white w-44 rounded-full hover:bg-blue-700 transition" onClick={() => router.push('/two')}>Go to Page two</button>
            </div>
        </div>
    )
}