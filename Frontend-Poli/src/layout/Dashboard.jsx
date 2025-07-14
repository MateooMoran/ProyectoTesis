import { Sidebar } from "../pages/Sidebar";

export const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar></Sidebar>
      <main className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-blue-950">Bienvenido al Panel</h1>
        <h2>Complete</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum, repellat. Accusamus consectetur sapiente labore mollitia dignissimos, illo dolorum repudiandae, amet iure quis sequi voluptatum tempora eos fuga. Cupiditate, eveniet quaerat.</p>
      </main>
    </div>
  );
};
