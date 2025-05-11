import { useEffect, useState } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Section } from "../components/Section";
import { toast } from "react-toastify";

export default function Profile() {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [reservedBooks, setReservedBooks] = useState<any[]>([]);
  const [borrowedEBooks, setBorrowedEBooks] = useState<any[]>([]);
  const [lostBooks, setLostBooks] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
    zipcode: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disabledLost, setDisabledLost] = useState<string[]>([]);
  const states = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ];

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(res);

        setUserDetails({
          name: res.data.name,
          email: res.data.email,
          mobile: res.data.mobile,
          city: res.data.city,
          state: res.data.state,
          zipcode: res.data.zipcode,
        });

        setBorrowedBooks(res.data.borrowedBooks || []);
        setReservedBooks(res.data.reservedBooks || []);
        setBorrowedEBooks(res.data.borrowedEBooks || []);
        setLostBooks(res.data.lostBooks || []);

        // 🔥 Check for a new lost book
        const storedLost = localStorage.getItem("newLostBook");
        if (storedLost) {
          const lostBook = JSON.parse(storedLost);
          setLostBooks((prev) => [...prev, lostBook]);
          localStorage.removeItem("newLostBook");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Mark book as lost if redirected from payment
  useEffect(() => {
    const bookId = searchParams.get("lostBookId");
    if (bookId) {
      axios
        .patch(
          `http://localhost:3001/books/${bookId}/lost`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          toast.error("Book marked as lost!");
          setDisabledLost((prev) => [...prev, bookId]);
          navigate("/profile");
        })
        .catch((err) => {
          console.error("Failed to mark book as lost:", err);
        });
    }
  }, [token, navigate, searchParams]);

  if (loading) return <p className="p-6 text-gray-500">Loading profile...</p>;

  return (
    <div className="p-6">
      <div className="mb-8 bg-white rounded shadow p-4 max-w-lg">
        <h3 className="text-lg font-semibold mb-4">👤 Personal Information</h3>
        {isEditing ? (
          <>
            <input
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="Name"
              value={userDetails.name}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
            />
            <input
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="Email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
            />
            <input
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="Mobile"
              value={userDetails.mobile}
              onChange={(e) =>
                setUserDetails({ ...userDetails, mobile: e.target.value })
              }
            />
            <input
              type="text"
              name="city"
              value={userDetails.city}
              onChange={(e) =>
                setUserDetails({ ...userDetails, city: e.target.value })
              }
              placeholder="City"
              required
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <select
              name="state"
              value={userDetails.state}
              onChange={(e) =>
                setUserDetails({ ...userDetails, state: e.target.value })
              }
              required
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 outline-none"
            >
              <option value="">Select a State</option>
              {states.map((state) => (
                <option key={state.code} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="zipcode"
              value={userDetails.zipcode}
              onChange={(e) =>
                setUserDetails({ ...userDetails, zipcode: e.target.value })
              }
              placeholder="Zipcode"
              pattern="^\d{5}$"
              required
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await axios.patch(
                      "http://localhost:3001/users/update-profile",
                      userDetails,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    toast.success("Profile updated!");
                    setIsEditing(false);
                  } catch (err) {
                    toast.error("Failed to update profile.");
                    console.error(err);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-1">
              <strong>Name:</strong> {userDetails.name}
            </p>
            <p className="mb-1">
              <strong>Email:</strong> {userDetails.email}
            </p>
            <p className="mb-1">
              <strong>Mobile:</strong> {userDetails.mobile}
            </p>
            <p className="mb-1">
              <strong>City:</strong> {userDetails.city}
            </p>
            <p className="mb-1">
              <strong>State:</strong> {userDetails.state}
            </p>
            <p className="mb-1">
              <strong>Zipcode:</strong> {userDetails.zipcode}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-6">📚 My Book Profile</h2>

      <Section
        title="Borrowed Books"
        color="text-green-700"
        books={borrowedBooks}
        type="borrowed"
        image="book.jpg"
        disabledLost={disabledLost}
        setBooks={setBorrowedBooks}
      />

      <Section
        title="Reserved Books"
        color="text-yellow-700"
        image="book.jpg"
        books={reservedBooks}
        type="reserved"
      />

      <Section
        title="Borrowed E-Books"
        color="text-blue-700"
        image="ebook.jpg"
        books={borrowedEBooks}
        type="ebook"
      />

      <Section
        title="Lost Books"
        color="text-red-700"
        image="book.jpg"
        books={lostBooks}
        type="borrowed"
      />
    </div>
  );
}
