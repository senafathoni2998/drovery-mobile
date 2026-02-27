export type DeliveryStatus = "current" | "completed" | "canceled";

export type DeliveryItem = {
  id: string;
  title: string;
  status: DeliveryStatus;
  subtitle?: string;
};

export type SortOption = "recent" | "title" | "status";

export const MOCK_ITEMS: DeliveryItem[] = [
  {
    id: "11324572",
    title: "Hamburger & Fries",
    status: "current",
    subtitle: "ETA 11:00 AM",
  },
  {
    id: "11324573",
    title: "Aspirin (Healthcare)",
    status: "completed",
    subtitle: "Delivered 10:42 AM",
  },
  {
    id: "11324574",
    title: "Fresh Vegetables",
    status: "completed",
    subtitle: "Delivered Yesterday",
  },
  {
    id: "11324575",
    title: "Laptop Parcel",
    status: "current",
    subtitle: "On the way",
  },
  {
    id: "11324576",
    title: "Office Documents",
    status: "canceled",
    subtitle: "Canceled by sender",
  },
  {
    id: "11324577",
    title: "Books & Stationery",
    status: "completed",
    subtitle: "Delivered 2 days ago",
  },
  {
    id: "11324578",
    title: "Protein Shakes",
    status: "current",
    subtitle: "Picked up 10 mins ago",
  },
];

export const TABS: { key: DeliveryStatus; label: string }[] = [
  { key: "current", label: "Current Delivery" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
];
