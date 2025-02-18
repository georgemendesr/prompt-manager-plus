
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/prompts");
    return null;
  }

  navigate("/auth");
  return null;
};

export default Index;
