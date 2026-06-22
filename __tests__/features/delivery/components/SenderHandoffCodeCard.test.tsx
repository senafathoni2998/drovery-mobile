import React from "react";
import { Share } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

import { SenderHandoffCodeCard } from "@/features/delivery/screens/DeliveryDetailScreen/components/SenderHandoffCodeCard";
import { getHandoffCode } from "@/features/delivery/services/handoffCodeStore";

jest.mock("@/features/delivery/services/handoffCodeStore");

const mockGet = getHandoffCode as jest.Mock;

describe("SenderHandoffCodeCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reveals the cached code and shares it with the recipient", async () => {
    mockGet.mockResolvedValue("ABC123");
    const shareSpy = jest
      .spyOn(Share, "share")
      .mockResolvedValue({ action: "sharedAction" } as never);

    const { getByText } = render(
      <SenderHandoffCodeCard deliveryId="d-1" receiver="Jane" />,
    );

    // Generous timeout: jest-expo's first-run transform can exceed the 1s default cold.
    await waitFor(() => expect(getByText("ABC123")).toBeTruthy(), {
      timeout: 5000,
    });

    fireEvent.press(getByText("Share with recipient"));
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("ABC123") }),
    );
  });

  it("renders nothing when this device holds no cached code", async () => {
    mockGet.mockResolvedValue(null);

    const { toJSON } = render(<SenderHandoffCodeCard deliveryId="d-2" />);

    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("d-2"));
    expect(toJSON()).toBeNull();
  });
});
