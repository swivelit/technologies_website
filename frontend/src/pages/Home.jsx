import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />

      <main className="hero">
        <h1>500+ Projects. One Step Towards Your Career.</h1>

        <p>
          Build real-world projects, gain practical experience,
          strengthen your portfolio, and prepare for your career.
        </p>

        <div className="hero-buttons">
          <Link to="/projects" className="button">
            Browse Projects
          </Link>

          <Link to="/register" className="button secondary">
            Register
          </Link>
        </div>
      </main>

      <section className="benefits">
        <h2>Program Benefits</h2>

        <div className="benefit-list">
          <div>500+ Real-World Projects</div>
          <div>Career & Job Readiness Support</div>
          <div>Practical Project Experience</div>
          <div>Change Your Domain With Ease</div>
        </div>
      </section>
    </>
  );
}

export default Home;