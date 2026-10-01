"use client";

import { addItemsToCart } from "@/redux/cartSlice";
import { AppDispatch } from "@/redux/store";
import axios from "axios";
import { Bot, LoaderCircle, Send, ShoppingCart, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";

type GroceryItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type RecipeResult = {
  dish: string;
  servings: number;
  available: Array<{
    grocery: GroceryItem;
    quantity: number;
    requiredQuantity: string;
  }>;
  unavailable: Array<{
    name: string;
    requiredQuantity: string;
  }>;
};

function RecipeCartAssistant() {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecipeResult | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!description.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post<RecipeResult>("/api/user/recipe-cart", {
        description: description.trim(),
        servings,
      });

      const recipeResult = response.data;
      setResult(recipeResult);

      if (recipeResult.available.length > 0) {
        dispatch(
          addItemsToCart(
            recipeResult.available.map(({ grocery, quantity }) => ({
              ...grocery,
              quantity,
            }))
          )
        );
      }
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || "Unable to create the ingredient list.");
      } else {
        setError("Unable to create the ingredient list.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 font-semibold text-white shadow-xl transition hover:bg-green-700"
        aria-label="Open recipe cart assistant"
      >
        <Bot size={22} />
        <span className="hidden sm:inline">Recipe Assistant</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-0 sm:p-6">
          <section className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
            <header className="flex items-center justify-between bg-green-700 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <Bot />
                <div>
                  <h2 className="font-bold">SnapCart Recipe Assistant</h2>
                  <p className="text-xs text-green-100">Tell me what you want to cook</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">
                <X />
              </button>
            </header>

            <div className="overflow-y-auto p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="meal-description" className="mb-1 block text-sm font-semibold text-gray-700">
                    What would you like to make?
                  </label>
                  <textarea
                    id="meal-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Example: Paneer butter masala with rice"
                    className="w-full resize-none rounded-xl border border-gray-300 p-3 text-gray-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="meal-servings" className="mb-1 block text-sm font-semibold text-gray-700">
                    Number of people
                  </label>
                  <input
                    id="meal-servings"
                    type="number"
                    min={1}
                    max={50}
                    value={servings}
                    onChange={(event) => setServings(Number(event.target.value))}
                    className="w-full rounded-xl border border-gray-300 p-3 text-gray-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !description.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading ? <LoaderCircle className="animate-spin" size={20} /> : <Send size={19} />}
                  {loading ? "Finding ingredients..." : "Add ingredients to cart"}
                </button>
              </form>

              {error && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
              )}

              {result && (
                <div className="mt-5 space-y-4 text-sm">
                  <div className="rounded-xl bg-green-50 p-4 text-green-900">
                    <div className="mb-2 flex items-center gap-2 font-bold">
                      <ShoppingCart size={18} />
                      Added for {result.dish} ({result.servings} people)
                    </div>
                    {result.available.length > 0 ? (
                      <ul className="space-y-1">
                        {result.available.map(({ grocery, quantity, requiredQuantity }) => (
                          <li key={grocery._id}>
                            {grocery.name}: {requiredQuantity} ({quantity} cart unit{quantity > 1 ? "s" : ""})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No requested ingredients were available.</p>
                    )}
                  </div>

                  {result.unavailable.length > 0 && (
                    <div className="rounded-xl bg-amber-50 p-4 text-amber-900">
                      <p className="mb-2 font-bold">Not available in SnapCart</p>
                      <ul className="space-y-1">
                        {result.unavailable.map((item, index) => (
                          <li key={`${item.name}-${index}`}>
                            {item.name}: {item.requiredQuantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default RecipeCartAssistant;
