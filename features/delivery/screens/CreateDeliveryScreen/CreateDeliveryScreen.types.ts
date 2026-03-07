export interface CreateDeliveryFormData {
  from: string;
  to: string;
  receiver: string;
  packages: string;
  packageSize: string;
  packageWeight: string;
  pickupDate: string;
  pickupTime: string;
  packageTypes: string[];
}

export interface PackageType {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}


import { MaterialIcons } from "@expo/vector-icons";
