import * as React from "react";
import { useNavigate } from "@remix-run/react";


export default function Index() {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate("/app/collections");
  }, []);

  return (<></>)

}
