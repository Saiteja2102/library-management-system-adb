import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PaymentModal from "../components/PaymentModal";
import { Search } from "lucide-react";

export interface DigitalResource {
  _id?: string;
  resourceId: string;
  title: string;
  author: string;
  category: string;
  fileUrl: string;
  cost: number;
  publishedYear: string;
  numOfPages: number;
  availableCopies: number;
}

export default function DigitalResources() {
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [openPickerFor, setOpenPickerFor] = useState<string | null>(null);
  const [startDates, setStartDates] = useState<Record<string, Date | null>>({});
  const [endDates, setEndDates] = useState<Record<string, Date | null>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResource, setSelectedResource] =
    useState<DigitalResource | null>(null);
  const [bookedResourceIds, setBookedResourceIds] = useState<Set<string>>(
    new Set()
  );
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/digital-resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(res.data);
    };

    fetchResources();
  }, []);

  const handleBookClick = (res: DigitalResource) => {
    setOpenPickerFor((prev) => (prev === res._id ? null : res._id || null));
  };

  const handleConfirmBooking = (res: DigitalResource) => {
    const start = new Date();
    const end = endDates[res._id!];

    if (
      !(start instanceof Date) ||
      !(end instanceof Date) ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      toast.error("Please select valid start and end dates.");
      return;
    }

    if (end <= start) {
      toast.error("End date must be after start date.");
      return;
    }

    setSelectedResource(res);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedResource) return;
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `http://localhost:3001/digital-resources/${selectedResource._id}/borrow`,
        {
          startTime: new Date(),
          endTime: endDates[selectedResource._id!],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("E-Book booked successfully!");

      setBookedResourceIds((prev) => new Set(prev).add(selectedResource._id!));
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to borrow resource.");
    } finally {
      setShowPaymentModal(false);
      setOpenPickerFor(null);
      setStartDates((prev) => ({ ...prev, [selectedResource?._id!]: null }));
      setEndDates((prev) => ({ ...prev, [selectedResource?._id!]: null }));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md"
        style={{ backgroundImage: "url('/bg-ebook.jpg')" }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 p-6">
        {/* Header and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white drop-shadow mb-2 sm:mb-0">
            Digital Resources
          </h2>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded border"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          </div>
        </div>

        {/* Grid of Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {resources
            .filter((res) => {
              const search = searchText.toLowerCase();
              return (
                res.title.toLowerCase().includes(search) ||
                res.author.toLowerCase().includes(search) ||
                res.category.toLowerCase().includes(search)
              );
            })
            .map((res) => {
              const showPicker = openPickerFor === res._id;
              const start = startDates[res._id!];
              const end = endDates[res._id!];

              return (
                <div
                  key={res._id}
                  className="border p-4 rounded shadow flex flex-col justify-between bg-white"
                >
                  <div className="m-auto">
                    <img
                      src="ebook.jpg"
                      alt="Resource"
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="font-bold text-lg">{res.title}</p>
                    <p className="text-sm">{res.author}</p>
                    <p className="text-sm">{res.category}</p>
                    <p className="text-sm text-gray-500">Cost: ${res.cost}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleBookClick(res)}
                      className={`${
                        bookedResourceIds.has(res._id!) ||
                        res.availableCopies === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white px-4 py-2 rounded w-full`}
                      disabled={
                        bookedResourceIds.has(res._id!) ||
                        res.availableCopies === 0
                      }
                    >
                      {bookedResourceIds.has(res._id!)
                        ? "Already Booked"
                        : res.availableCopies === 0
                        ? "Unavailable"
                        : showPicker
                        ? "Cancel"
                        : "Book Now"}
                    </button>

                    {showPicker && !bookedResourceIds.has(res._id!) && (
                      <div className="mt-4 space-y-2">
                        {/* <DatePicker
                          selected={start}
                          onChange={(date) =>
                            setStartDates((prev) => ({
                              ...prev,
                              [res._id!]: date,
                            }))
                          }
                          selectsStart
                          startDate={start}
                          endDate={end}
                          placeholderText="Start Date"
                          dateFormat="yyyy-MM-dd"
                          className="border px-2 py-1 rounded w-full"
                          minDate={new Date()}
                        /> */}
                        <DatePicker
                          selected={end}
                          onChange={(date) =>
                            setEndDates((prev) => ({
                              ...prev,
                              [res._id!]: date,
                            }))
                          }
                          selectsEnd
                          startDate={start}
                          endDate={end}
                          placeholderText="End Date"
                          dateFormat="yyyy-MM-dd"
                          className="border px-2 py-1 rounded w-full"
                          minDate={new Date()}
                        />
                        <button
                          onClick={() => handleConfirmBooking(res)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Payment Modal */}
        {selectedResource && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
            actionType="borrow"
            amount={0}
          />
        )}
      </div>
    </div>
  );
}
