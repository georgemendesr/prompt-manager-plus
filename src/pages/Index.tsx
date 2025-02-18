
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  if (session) {
    navigate("/prompts");
    return null;
  }

  navigate("/auth");
  return null;
};

export default Index;
