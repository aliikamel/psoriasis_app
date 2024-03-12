import React from "react";
import PasiUvbForm from "./PasiUvbForm";
import Sidebar, { SidebarItem } from "../Sidebar";
import {
  LayoutDashboard,
  Home,
  Layers,
  Calendar,
  UsersRound,
  BrainCircuit,
} from "lucide-react";

function SimulateModel() {
  return (
    <div className="flex h-mx">
      <Sidebar className="">
        <a href="/">
          <SidebarItem icon={<Home size={20} />} text="Home" />
        </a>
        <a href="/dashboard">
          <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" />
        </a>
        <a href="/patients">
          <SidebarItem icon={<UsersRound size={20} />} text="Patients" />
        </a>
        <a href="simulate-model">
          <SidebarItem
            icon={<BrainCircuit size={20} />}
            text="Model Simulation"
            active
          />
        </a>

        <SidebarItem icon={<Calendar size={20} />} text="Calendar" />
        <SidebarItem icon={<Layers size={20} />} text="Tasks" />

        {/* <hr className="my-3" />
        <SidebarItem icon={<Settings size={20} />} text="Settings" />
        <SidebarItem icon={<LifeBuoy size={20} />} text="Help" /> */}
      </Sidebar>

      <PasiUvbForm />
    </div>
  );
}

export default SimulateModel;
