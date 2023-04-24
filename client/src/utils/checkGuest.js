import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function CheckGuest({ children }) {
  const auth = useSelector((state) => state.auth);
  return !auth.isAuthenticated ? children : <Navigate to={"/chats"} />;
}
