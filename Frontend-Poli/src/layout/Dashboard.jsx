import { Sidebar } from "./Sidebar";

export const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar></Sidebar>
      <main className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-blue-950">Bienvenido al Panel</h1>
      </main>
    </div>
  );
};
