import React, { useState, useMemo } from "react";
import { X, Plus, Minus } from "lucide-react";
import { SERVICES } from "../constants";
import { Service, ServiceCategory, Appointment } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Appointment) => void;
}

// Track service + quantity together
interface ServiceEntry {
  service: Service;
  quantity: number;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [serviceEntries, setServiceEntries] = useState<ServiceEntry[]>([]);
  const [showConsultationPopup, setShowConsultationPopup] = useState(false);
  const [pendingService, setPendingService] = useState<Service | null>(null);

  if (!isOpen) return null;

  const filteredServices = SERVICES.filter((s) => s.category === category);

  // Get the quantity of a specific service (0 if not selected)
  const getQuantity = (serviceId: string) =>
    serviceEntries.find((e) => e.service.id === serviceId)?.quantity ?? 0;

  // Add one unit of a service
  const addService = (service: Service) => {
    setServiceEntries((prev) => {
      const existing = prev.find((e) => e.service.id === service.id);
      if (existing) {
        return prev.map((e) =>
          e.service.id === service.id
            ? { ...e, quantity: e.quantity + 1 }
            : e
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  // Remove one unit of a service (remove entry if it hits 0)
  const removeService = (serviceId: string) => {
    setServiceEntries((prev) => {
      const existing = prev.find((e) => e.service.id === serviceId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((e) => e.service.id !== serviceId);
      }
      return prev.map((e) =>
        e.service.id === serviceId ? { ...e, quantity: e.quantity - 1 } : e
      );
    });
  };

  const hasVariableService = useMemo(
    () => serviceEntries.some((e) => e.service.priceType === "variable"),
    [serviceEntries]
  );

  const totalPrice = useMemo(() => {
    if (hasVariableService) return null;
    return serviceEntries.reduce(
      (sum, e) => sum + (e.service.price ?? 0) * e.quantity,
      0
    );
  }, [serviceEntries, hasVariableService]);

  // Flatten entries into services array for Appointment (quantity copies)
  const flattenedServices = useMemo(
    () =>
      serviceEntries.flatMap(({ service, quantity }) =>
        Array(quantity).fill(service)
      ),
    [serviceEntries]
  );

  const goToInstagramConsultation = (service: Service) => {
    const message = encodeURIComponent(
      `Hello Amethyst Aura Spa 👋🏽\n\nI'd like to book a consultation for:\n• ${service.name}\n\nPlease let me know the next steps. Thank you ✨`
    );
    window.open(
      `https://www.instagram.com/amethystsaura/?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        {/* STEP 1 — CATEGORY */}
        {step === 1 && (
          <>
            <h2 className="text-xl mb-6">Choose Category</h2>
            {Object.values(ServiceCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setStep(2);
                }}
                className="block w-full text-left mb-2 p-3 border rounded"
              >
                {cat}
              </button>
            ))}
          </>
        )}

        {/* STEP 2 — SERVICES with quantity controls */}
        {step === 2 && (
          <>
            <h2 className="text-xl mb-6">{category}</h2>

            {filteredServices.map((service) => {
              const qty = getQuantity(service.id);
              const isVariable = service.priceType === "variable";

              return (
                <div
                  key={service.id}
                  className="flex justify-between items-center w-full p-3 border mb-2 rounded"
                >
                  {/* Service info */}
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="font-bold text-sm leading-tight">
                      {service.name}
                      {service.duration && (
                        <span className="font-normal text-gray-400 ml-1">
                          · {service.duration}
                        </span>
                      )}
                    </div>
                    {isVariable ? (
                      <div className="text-xs text-gray-500">
                        {service.priceRange ?? "Consultation required"}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        ₦{service.price?.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Quantity controls */}
                  {isVariable ? (
                    /* Variable-price services just open consultation */
                    <button
                      onClick={() => {
                        setPendingService(service);
                        setShowConsultationPopup(true);
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white flex-shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  ) : qty === 0 ? (
                    /* Not yet selected — show a single + button */
                    <button
                      onClick={() => addService(service)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white flex-shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  ) : (
                    /* Already selected — show − qty + controls */
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => removeService(service.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-5 text-center font-semibold">
                        {qty}
                      </span>
                      <button
                        onClick={() => addService(service)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {serviceEntries.length > 0 && (
              <button
                onClick={() => setStep(3)}
                className="mt-6 w-full bg-black text-white p-3 rounded"
              >
                Continue ({serviceEntries.reduce((n, e) => n + e.quantity, 0)}{" "}
                item
                {serviceEntries.reduce((n, e) => n + e.quantity, 0) !== 1
                  ? "s"
                  : ""}
                )
              </button>
            )}
          </>
        )}

        {/* STEP 3 — SUMMARY */}
        {step === 3 && (
          <>
            <h2 className="text-xl mb-6">Summary</h2>

            {serviceEntries.map(({ service, quantity }) => (
              <div key={service.id} className="flex justify-between mb-2">
                <span>
                  {service.name}
                  {quantity > 1 && (
                    <span className="ml-1 text-sm text-gray-500">
                      × {quantity}
                    </span>
                  )}
                </span>

                {service.priceType === "variable" ? (
                  <span className="text-xs text-gray-500">
                    Consultation required
                  </span>
                ) : (
                  <span>
                    ₦{((service.price ?? 0) * quantity).toLocaleString()}
                  </span>
                )}
              </div>
            ))}

            <div className="border-t pt-4 mt-4 flex justify-between">
              <strong>Total Investment</strong>

              {hasVariableService ? (
                <span className="text-sm text-gray-500">
                  Depends on consultation
                </span>
              ) : (
                <strong>₦{totalPrice?.toLocaleString()}</strong>
              )}
            </div>
          </>
        )}

        {/* Consultation popup */}
        {showConsultationPopup && pendingService && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
              <h3 className="text-lg font-bold">Consultation Required</h3>

              <p className="text-sm text-gray-600">
                To know the exact cost for{" "}
                <strong>{pendingService.name}</strong>, you'll need a quick
                consultation.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    goToInstagramConsultation(pendingService);
                    setShowConsultationPopup(false);
                  }}
                  className="flex-1 bg-black text-white py-2 rounded"
                >
                  Continue to Consultation
                </button>

                <button
                  onClick={() => {
                    setShowConsultationPopup(false);
                    setPendingService(null);
                  }}
                  className="flex-1 border py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
