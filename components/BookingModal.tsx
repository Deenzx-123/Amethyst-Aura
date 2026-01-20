import React, { useState, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { SERVICES } from "../constants";
import { Service, ServiceCategory, Appointment } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Appointment) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [showConsultationPopup, setShowConsultationPopup] = useState(false);
const [pendingService, setPendingService] = useState<Service | null>(null);



  if (!isOpen) return null;

  // ✅ THIS IS THE MOST IMPORTANT FIX
  const hasVariableService = useMemo(
    () => selectedServices.some(s => s.priceType === "variable"),
    [selectedServices]
  );

  // ✅ SAFE TOTAL CALCULATION (CANNOT PRODUCE ₦0 BUG)
  const totalPrice = useMemo(() => {
    if (hasVariableService) return null;
    return selectedServices.reduce(
      (sum, s) => sum + (s.price ?? 0),
      0
    );
  }, [selectedServices, hasVariableService]);

  const filteredServices = SERVICES.filter(
    s => s.category === category
  );

  const toggleService = (service: Service) => {
    setSelectedServices(prev =>
      prev.some(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

const goToInstagramConsultation = (service: Service) => {
  const message = encodeURIComponent(
    `Hello Amethyst Aura Spa 👋🏽\n\nI’d like to book a consultation for:\n• ${service.name}\n\nPlease let me know the next steps. Thank you ✨`
  );

  window.open(
    `https://www.instagram.com/amethystsaura/?text=${message}`,
    "_blank"
  );
};


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-2xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X />
        </button>

        {/* STEP 1 — CATEGORY */}
        {step === 1 && (
          <>
            <h2 className="text-xl mb-6">Choose Category</h2>
            {Object.values(ServiceCategory).map(cat => (
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

        {/* STEP 2 — SERVICES */}
        {step === 2 && (
          <>
            <h2 className="text-xl mb-6">{category}</h2>

            {filteredServices.map(service => {
              const selected = selectedServices.some(
                s => s.id === service.id
              );

              return (
                <button
                  key={service.id}
                  onClick={() => {
  if (service.priceType === "variable") {
    setPendingService(service);
    setShowConsultationPopup(true);
  } else {
    toggleService(service);
  }
}}


                  className="flex justify-between items-center w-full p-3 border mb-2 rounded"
                >
                  <div>
                    <div className="font-bold">{service.name}</div>

                    {service.priceType === "variable" ? (
                      <div className="text-xs text-gray-500">
                        {service.priceRange ?? "Consultation required"}
                      </div>
                    ) : (
                      <div className="text-sm">
                        ₦{service.price?.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <Plus />
                </button>
              );
            })}

            {selectedServices.length > 0 && (
              <button
                onClick={() => setStep(3)}
                className="mt-6 w-full bg-black text-white p-3 rounded"
              >
                Continue
              </button>
            )}
          </>
        )}

        {/* STEP 3 — SUMMARY */}
        {step === 3 && (
          <>
            <h2 className="text-xl mb-6">Summary</h2>

            {selectedServices.map(service => (
              <div
                key={service.id}
                className="flex justify-between mb-2"
              >
                <span>{service.name}</span>

                {service.priceType === "variable" ? (
                  <span className="text-xs text-gray-500">
                    Consultation required
                  </span>
                ) : (
                  <span>
                    ₦{service.price?.toLocaleString()}
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
                <strong>
                  ₦{totalPrice?.toLocaleString()}
                </strong>
              )}
            </div>
          </>
        )}

{showConsultationPopup && pendingService && (
  <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center space-y-4">

      <h3 className="text-lg font-bold">
        Consultation Required
      </h3>

      <p className="text-sm text-gray-600">
        To know the exact cost for <strong>{pendingService.name}</strong>,
        you’ll need a quick consultation.
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
