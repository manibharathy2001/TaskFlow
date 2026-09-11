import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await api.get("/health");

        setMessage(response.data.message);
      } catch (error) {
        console.error("API connection failed:", error);
        setMessage("API connection failed");
      }
    };

    testApiConnection();
  }, []);

  return (
    <div className="page">
      <h2>Welcome to TaskFlow</h2>
      <p>Manage your tasks efficiently.</p>

      <p>
        Backend status: <strong>{message}</strong>
      </p>
    </div>
  );
}

export default Home;