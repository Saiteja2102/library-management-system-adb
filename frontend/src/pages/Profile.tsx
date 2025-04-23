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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disabledLost, setDisabledLost] = useState<string[]>([]);

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
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Name"
        value={userDetails.name}
        onChange={(e) =>
          setUserDetails({ ...userDetails, name: e.target.value })
        }
      />
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Email"
        value={userDetails.email}
        onChange={(e) =>
          setUserDetails({ ...userDetails, email: e.target.value })
        }
      />
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Mobile"
        value={userDetails.mobile}
        onChange={(e) =>
          setUserDetails({ ...userDetails, mobile: e.target.value })
        }
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
      <p className="mb-1"><strong>Name:</strong> {userDetails.name}</p>
      <p className="mb-1"><strong>Email:</strong> {userDetails.email}</p>
      <p className="mb-1"><strong>Mobile:</strong> {userDetails.mobile}</p>
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
