import { SideBar } from "@/components/SideBar"

export default function Home() {

  return (
    <div className="bg-white flex">
    <SideBar />
    <div className="ml-64 w-full min-h-screen flex flex-col justify-center items-center text-center">
      <h2 className="text-2xl antialiased font-bold p-4">
        This is the first Assignment of Data Visualization
      </h2>
      <p>Please Click Page one for first qn or Page 2 for second qn</p>
    </div>
  </div>
  );
}


