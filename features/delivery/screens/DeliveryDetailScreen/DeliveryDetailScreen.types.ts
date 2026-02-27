export type StepState = "done" | "current" | "upcoming";

export interface Delivery {
  id: string;
  status: string;
  from: string;
  to: string;
  sender: string;
  receiver: string;
  pickupAt: string;
  eta: string;
  pkg: {
    name: string;
    size: string;
    weight: string;
  };
}

export interface Step {
  title: string;
  desc: string;
}

export const MOCK_DELIVERY: Delivery = {
  id: "124213152",
  status: "On Progress",
  from: "Jl. Padjajaran Raya No. 21",
  to: "Jl. Otto Iskandar Dinata No.21",
  sender: "Mika Ratna",
  receiver: "Moko diska",
  pickupAt: "25 March 2025, 09:00 AM",
  eta: "25 March 2025, 11:00 AM",
  pkg: {
    name: "Aspirin (Healthcare)",
    size: "12 cm × 24 cm × 40 cm",
    weight: "0.7 kg",
  },
};

export const STEPS: Step[] = [
  {
    title: "Pickup scheduled",
    desc: "The pickup process will start on 25 March 2025, 09:00 AM. A drone will come to the pickup location.",
  },
  {
    title: "Drone arrived",
    desc: "Drone arrived at pickup location, package is loaded into the drone storage.",
  },
  {
    title: "In delivery",
    desc: "The drone is delivering the package to the drop-off point.",
  },
  {
    title: "Delivered",
    desc: "The drone has successfully delivered the package to the destination point.",
  },
];

export const CURRENT_STEP_INDEX = 1;
