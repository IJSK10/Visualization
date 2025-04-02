"use client"
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <button
        className="absolute left-10 top-1/2 transform -translate-y-1/2 px-1 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        onClick={() => router.push('/plots')}
      >
        Go to Plot
      </button>


      <div className="relative flex flex-col ml-40 text-black bg-white min-h-screen">

        <div className="w-full p-6">
          <h2 className="text-2xl antialiased font-bold p-4 flex items-center justify-center gap-2">
            <Image width="48" height="48" src="https://img.icons8.com/fluency/48/ps-controller.png" alt="ps-controller" />
            Video Games Analytics
          </h2>
          <p className="text-justify pr-20">
            The aim of the project is visualization using D3.js and Next.js. The MSE plots, MDS Data chart, MDS Variable chart and PCA plots are drawn to explore the visualizations. These visualizations help analyze trends in game data, such as sales patterns, genre popularity, and rating distributions. The project aims to provide meaningful insights through interactive and dynamic charts.
          </p>

          <div className="flex space-x-10 mt-16">

            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-700 mb-4">Categorical Variables:</h2>
              <ul className="list-none pl-5 space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Publisher:</span> The company responsible for distributing the game.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Developer:</span> The company or studio that created the game.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Meta Status:</span> Categorization based on Metacritic scores (e.g., Universal Acclaim, Mixed, etc.).
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Userscore Status:</span> Classification of user scores into predefined categories.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Genre:</span> The type of game (e.g., Action, RPG, Sports).
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Rating:</span> ESRB rating (e.g., E, T, M) indicating suitable age groups.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Month:</span> The month in which the game was released.
                </li>
              </ul>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-700 mb-4">Numerical Variables:</h2>
              <ul className="list-none pl-5 space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 font-semibold">Metascore:</span> The aggregated critic score from Metacritic.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-semibold"># of Critic Reviews:</span> The total number of critic reviews available.
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
