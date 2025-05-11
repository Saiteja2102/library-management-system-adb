import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "../context/LocationContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PaymentModal from "../components/PaymentModal";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import { Book } from "../types/books";

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookForPayment, setSelectedBookForPayment] =
    useState<any>(null);
  const { location } = useLocation();
  const [openPickerFor, setOpenPickerFor] = useState<string | null>(null);
  const [endDates, setEndDates] = useState<Record<string, Date | null>>({});
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const categoryDurations: Record<string, number> = {
    "Artificial Intelligence": 7,
    "Machine Learning": 10,
    "Data Science": 14,
    "Big Data": 7,
    Cybersecurity: 10,
    "Software Engineering": 7,
    "Cloud Computing": 10,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload?.sub || null);
    }

    const fetchBooks = async () => {
      const res = await axios.get("http://localhost:3001/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    };

    fetchBooks();
  }, []);

  const filteredBooks = books
    .filter((book: any) => (location ? book.location === location : true))
    .filter((book: any) =>
      selectedCategory ? book.category === selectedCategory : true
    )
    .filter((book: any) => {
      const search = searchText.toLowerCase();
      return (
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.category.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const submitBooking = async (book: any) => {
    const endDate = endDates[book._id];

    const isBorrowing = book.status === "available";
    const adjustedStart = isBorrowing
      ? new Date(Date.now() + 60 * 1000) // 1 minute in future
      : new Date(book.endTime); // 👈 for reservation, start after borrow end

    try {
      const token = localStorage.getItem("token");

      const endpoint = isBorrowing
        ? `http://localhost:3001/books/${book._id}/borrow`
        : `http://localhost:3001/books/${book._id}/reserve`;

      const payload = isBorrowing
        ? {
            startTime: adjustedStart.toISOString(),
            endTime: endDate!.toISOString(),
          }
        : {
            reserveStartTime: adjustedStart.toISOString(),
            reserveEndTime: endDate!.toISOString(),
          };

      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedBook = response.data.updatedBook;
      setBooks((prevBooks: any) =>
        prevBooks.map((b: any) => (b._id === updatedBook._id ? updatedBook : b))
      );

      toast.success(response.data.message);
      setOpenPickerFor(null);
      setEndDates((prev) => ({ ...prev, [book._id]: null }));
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const defaultDuration = 7; // fallback

  const validateAndProceedToPayment = (book: any) => {
    const categoryDuration =
      categoryDurations[book.category] || defaultDuration;
    const isBorrowing = book.status === "available";
    // const endDate = endDates[book._id];
    const startDate = new Date();
    const now = new Date();

    const adjustedStart = isBorrowing
      ? new Date(now.getTime() + 60 * 1000)
      : new Date(book.endTime);
    const endDate = new Date(adjustedStart);
    endDate.setDate(adjustedStart.getDate() + categoryDuration);

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      toast.error("Please select a valid end date.");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after today.");
      return;
    }

    const diffInDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays > 28) {
      toast.error("Booking period cannot exceed 4 weeks (28 days).");
      return;
    }

    // 🔒 Additional check for reservation only
    if (!isBorrowing && book.endTime) {
      const borrowEndDate = new Date(book.endTime);
      if (endDate <= borrowEndDate) {
        toast.error(
          `Reservation must end after borrow period (${borrowEndDate.toLocaleDateString()})`
        );
        return;
      }
    }
    setEndDates((prev) => ({ ...prev, [book._id]: endDate }));
    setSelectedBookForPayment(book);
    setShowPaymentModal(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md"
        style={{ backgroundImage: "url('/bg-book.jpg')" }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="Artificial Intelligence">
              Artificial Intelligence
            </option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Data Science">Data Science</option>
            <option value="Big Data">Big Data</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Cloud Computing">Cloud Computing</option>
          </select>
          <h2 className="text-2xl font-semibold text-white drop-shadow mb-2 sm:mb-0">
            {location ? `Books in ${location}` : "All Books"}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredBooks.map((book: any) => {
            const endDate = endDates[book._id];
            const showPicker = openPickerFor === book._id;

            return (
              <div
                key={book._id}
                className="border p-4 rounded shadow flex flex-col justify-between bg-white"
              >
                <div className="m-auto">
                  <img src="book.jpg" alt="Book Cover" className="mb-2" />
                  <p className="font-bold text-lg">Title: {book.title}</p>
                  <p className="text-sm">Author: {book.author}</p>
                  <p className="text-sm">Category: {book.category}</p>
                  <p className="text-sm text-gray-500">Status: {book.status}</p>
                  {book.status === "borrowed" &&
                    book.startTime &&
                    book.endTime && (
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>From:</strong>{" "}
                          {new Date(book.startTime).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>To:</strong>{" "}
                          {new Date(book.endTime).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                </div>

                {(book.status === "available" || book.status === "borrowed") &&
                  book.borrowedBy?.toString() !== userId && (
                    <>
                      <button
                        onClick={() =>
                          setOpenPickerFor((prev) =>
                            prev === book._id ? null : book._id
                          )
                        }
                        className={`mt-4 ${
                          book.status === "available"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-yellow-500 hover:bg-yellow-600"
                        } text-white px-4 py-2 rounded`}
                      >
                        {openPickerFor === book._id
                          ? "Cancel"
                          : book.status === "available"
                          ? "Book Now"
                          : "Reserve"}
                      </button>

                      {showPicker && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-gray-600">
                            Duration:{" "}
                            <span className="font-semibold">
                              {categoryDurations[book.category] ||
                                defaultDuration}{" "}
                              days
                            </span>
                          </p>

                          <button
                            onClick={() => validateAndProceedToPayment(book)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
                          >
                            Confirm{" "}
                            {book.status === "available"
                              ? "Booking"
                              : "Reservation"}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                {book.status === "borrowed" &&
                  book.borrowedBy?.toString() === userId && (
                    <button
                      disabled
                      className="mt-4 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                    >
                      Borrowed
                    </button>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedBookForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBookForPayment(null);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            submitBooking(selectedBookForPayment);
            setSelectedBookForPayment(null);
          }}
          actionType={
            selectedBookForPayment?.status === "available" ? "borrow" : "renew"
          }
          amount={0}
        />
      )}
    </div>
  );
}
