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

export interface StepAction {
  label: string;
  workflowId: string;
}

export interface Step {
  title: string;
  desc: string;
  action?: StepAction;
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
    title: "Pickup Scheduled",
    desc: "The pickup process will start on 25 March 2025, 09:00 AM. A drone will come to the pickup location.",
  },
  {
    title: "Drone on the Way to Pickup",
    desc: "A drone has been dispatched and is heading to the pickup location.",
  },
  {
    title: "Drone Arrived at Pickup Location",
    desc: "Drone arrived at pickup location, package is loaded into the drone storage.",
    action: { label: "Load Package", workflowId: "load_package" },
  },
  {
    title: "Drone in Delivery",
    desc: "The drone is delivering the package to the drop-off point.",
  },
  {
    title: "Drone Arrived at Drop-off Location",
    desc: "The drone has arrived at the destination and is preparing to drop off the package.",
    action: { label: "Unload Package", workflowId: "unload_package" },
  },
  {
    title: "Drone Delivered",
    desc: "The drone has successfully delivered the package to the destination point.",
  },
];

export const CURRENT_STEP_INDEX = 2;
