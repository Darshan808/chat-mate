import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { getUser } from "./Store/authSlice";
import axios from "axios";

function App() {
  const token = Cookies.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUser();
  }, []);
  function fetchUser() {
    setIsLoading(true);
    axios
      .get(`/api/auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {
        const { data } = res;
        dispatch(getUser(data.user));
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }

  if (isLoading) {
    return <p>Loading ...</p>;
  }
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
