import Image from 'next/image';
import SideBar from "@/components/SideBar";

export default function Home() {
  return (
    <div>
      <SideBar />
      <div className="flex flex-col ml-40 text-black bg-white">
        <div className="w-full min-h-screen p-6">
          <h2 className="text-2xl antialiased font-bold p-4 flex items-center justify-center gap-2">
            <Image width="48" height="48" src="https://img.icons8.com/fluency/48/ps-controller.png" alt="ps-controller" />
            Video Games Analytics
          </h2>
          <p className="text-justify pr-20">
            The aim of the project is visualization using D3.js and Next.js. The  MSE plots, biplots, clustering, and PCA analysis are drawn to explore the visualizations. These visualizations help analyze trends in game data, such as sales patterns, genre popularity, and rating distributions. The project aims to provide meaningful insights through interactive and dynamic charts.
          </p>

          <div className="flex justify-center mt-10">
            <div className="w-1/2">
              <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">Numerical Variables:</h2>
              <ul className="list-none pl-5 space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Metascore:</span> The aggregated critic score from Metacritic.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Userscore:</span> The average rating given by users.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Year:</span> The release year of the game.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Rank:</span> The ranking of the game based on sales or ratings.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Positive %:</span> The percentage of positive reviews.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Mixed %:</span> The percentage of mixed reviews.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Negative %:</span> The percentage of negative reviews.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">NA Sales:</span> The number of copies sold in North America.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Global Sales:</span> The total number of copies sold worldwide.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">User Count:</span> The number of users who reviewed or rated the game.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
