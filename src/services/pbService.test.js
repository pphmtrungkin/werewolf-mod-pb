import { describe, it, expect, vi, beforeEach } from "vitest";
import pb from "../pocketbase";
import * as pbService from "./pbService";

// Mock the pb module
vi.mock("../pocketbase", () => ({
  default: {
    collection: vi.fn(),
    baseUrl: "http://localhost:8090",
  },
}));

describe("pbService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCards", () => {
    it("should fetch cards sorted by card_order", async () => {
      const mockCards = [
        { id: "1", name: "Card 1", card_order: 1 },
        { id: "2", name: "Card 2", card_order: 2 },
      ];

      const mockCollection = {
        getFullList: vi.fn().mockResolvedValue(mockCards),
      };

      pb.collection.mockReturnValue(mockCollection);

      const result = await pbService.getCards();

      expect(pb.collection).toHaveBeenCalledWith("cards");
      expect(mockCollection.getFullList).toHaveBeenCalledWith({
        sort: "+card_order",
      });
      expect(result).toEqual(mockCards);
    });
  });

  describe("getSides", () => {
    it("should fetch sides sorted by hex_color", async () => {
      const mockSides = [
        { id: "1", name: "Good", hex_color: "#000000" },
        { id: "2", name: "Evil", hex_color: "#FFFFFF" },
      ];

      const mockCollection = {
        getFullList: vi.fn().mockResolvedValue(mockSides),
      };

      pb.collection.mockReturnValue(mockCollection);

      const result = await pbService.getSides();

      expect(pb.collection).toHaveBeenCalledWith("sides");
      expect(mockCollection.getFullList).toHaveBeenCalledWith({
        sort: "hex_color",
      });
      expect(result).toEqual(mockSides);
    });
  });

  describe("getDeck", () => {
    it("should fetch decks for a specific user", async () => {
      const userId = "user123";
      const mockDecks = [
        { id: "1", name: "Deck 1", owner: userId },
        { id: "2", name: "Deck 2", owner: userId },
      ];

      const mockCollection = {
        getFullList: vi.fn().mockResolvedValue(mockDecks),
      };

      pb.collection.mockReturnValue(mockCollection);

      const result = await pbService.getDeck(userId);

      expect(pb.collection).toHaveBeenCalledWith("decks");
      expect(mockCollection.getFullList).toHaveBeenCalledWith({
        filter: `owner = "${userId}"`,
      });
      expect(result).toEqual(mockDecks);
    });
  });

  describe("registerUser", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
        name: "testuser",
      };

      const mockUser = { id: "1", ...userData };

      const mockCollection = {
        create: vi.fn().mockResolvedValue(mockUser),
      };

      pb.collection.mockReturnValue(mockCollection);

      const result = await pbService.registerUser(userData);

      expect(pb.collection).toHaveBeenCalledWith("users");
      expect(mockCollection.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe("getFileUrl", () => {
    it("should return correct file URL", () => {
      const url = pbService.getFileUrl("users", "record123", "avatar.jpg");

      expect(url).toBe(
        "http://localhost:8090/api/files/users/record123/avatar.jpg",
      );
    });
  });
});
