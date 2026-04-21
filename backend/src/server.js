import cors from "cors";
import express from "express";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apartments = [
  {
    id: "apt-1",
    title: "Eiffel View Loft",
    price: 210,
    averageRating: 4.8,
    location: "Paris, France",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156"
  },
  {
    id: "apt-2",
    title: "Beachside Villa",
    price: 165,
    averageRating: 4.6,
    location: "Nice, France",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2"
  },
  {
    id: "apt-3",
    title: "Montmartre City Studio",
    price: 120,
    averageRating: 4.3,
    location: "Paris, France",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511"
  }
];

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "user1@mail.com" && password === "user123") {
    return res.json({
      token: "demo-token",
      user: { id: "user-1", email, name: "User 1" }
    });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

app.get("/api/apartments", (_req, res) => {
  res.json(apartments);
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
