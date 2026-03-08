import type { Workflow } from "../types";

export const unloadPackageWorkflow: Workflow = {
  id: "unload_package",
  title: "Unload Package",
  subtitle: "Follow the steps to collect your package from the drone",
  steps: [
    {
      id: "prepare_drone",
      type: "checklist",
      title: "Prepare Drone",
      instruction:
        "Before proceeding, confirm that the drone meets all of the following conditions:",
      items: [
        { id: "on_ground", label: "Drone is on the ground" },
        { id: "propeller_stopped", label: "Propeller has completely stopped" },
        { id: "led_yellow", label: "Drone LED is showing yellow" },
      ],
      next_label: "All Conditions Met",
    },
    {
      id: "show_qr",
      type: "qr_display",
      title: "Show Your QR Code",
      instruction:
        "Hold your phone up to the drone camera. The drone will scan your QR code and open the storage box automatically.",
      hint: "Keep the screen bright and steady for the drone camera to scan",
      next_label: "Box is Open",
    },
    {
      id: "scan_drone_qr",
      type: "qr_scan",
      title: "Scan Drone QR Code",
      instruction:
        "Scan the QR code displayed on the drone's screen to confirm this is the correct drone carrying your delivery.",
      hint: "Point your camera at the QR code shown on the drone display",
      next_label: "I've Scanned the QR",
    },
    {
      id: "take_package",
      type: "instruction",
      title: "Take Your Package",
      instruction:
        "Carefully remove your package from the open drone box. Check that nothing is left inside before proceeding.",
      icon: "hand-left-outline",
      icon_color: "#0EA5E9",
      next_label: "Package Collected",
    },
    {
      id: "press_button_verify",
      type: "drone_button",
      title: "Press Drone Button",
      instruction:
        "Press the physical button on the drone to confirm you have collected the package from the storage box.",
      icon: "radio-button-on",
      next_label: "Button Pressed",
    },
    {
      id: "check_led_green",
      type: "status_check",
      title: "Check Drone LED",
      instruction:
        "Check the drone LED indicator. A green LED means the unloading has been registered and the drone is ready to return.",
      indicator: {
        label: "LED is Green",
        color: "#22C55E",
        description: "Unload confirmed — drone ready to return",
      },
      next_label: "LED is Green",
    },
    {
      id: "confirm_takeoff",
      type: "drone_button",
      title: "Confirm & Step Back",
      instruction:
        "Press the drone button one more time to confirm, then immediately step back at least 3 meters to give the drone a clear space to take off safely.",
      icon: "walk-outline",
      next_label: "Done",
    },
  ],
};
