import MDSDataChart from "@/components/MDSDataChart";
import MDSVariablesChart from "@/components/MDSVariablesChart";
import PCAChart from "@/components/PCAChart";
import PCPPlot from "@/components/PCPPlot";

export default function Home() {
  return (
    <div>
      <h1>Data Visualization Dashboard</h1>
      <MDSDataChart />
      <MDSVariablesChart />
      {/* <PCAChart /> */}
      <PCPPlot />
    </div>
  );
}
