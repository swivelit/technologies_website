import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleEnroll = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/projects/${id}`,
        },
      });

      return;
    }

    // User is logged in
    // Enrollment logic can be added here later.
    alert("You are logged in. Enrollment can continue.");
  };

  return (
    <>
      <Navbar />

      <main className="page">
        <Link to="/projects">← Back to Projects</Link>

        <h1>Project Details</h1>

        <p>
          You are viewing project ID: <strong>{id}</strong>
        </p>

        <div className="project-details">
          <h2>E-Commerce Platform</h2>

          <p>
            Build a complete e-commerce application as a
            practical industry-oriented project.
          </p>

          <p>
            <strong>Technology:</strong> React
          </p>

          <p>
            <strong>Difficulty:</strong> Intermediate
          </p>

          <p>
            <strong>Duration:</strong> To be confirmed
          </p>

          <p>
            <strong>Prerequisites:</strong> To be confirmed
          </p>

          <button
            className="button"
            onClick={handleEnroll}
          >
            Enroll in Project
          </button>
        </div>
      </main>
    </>
  );
}

export default ProjectDetails;