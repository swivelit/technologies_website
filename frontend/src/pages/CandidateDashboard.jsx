import Navbar from "../components/Navbar";

function CandidateDashboard() {
  return (
    <>
      <Navbar />

      <main className="page">
        <h1>Candidate Dashboard</h1>

        <section>
          <h2>My Projects</h2>
          <p>No projects enrolled yet.</p>
        </section>

        <section>
          <h2>Progress</h2>
          <p>Your project progress will appear here.</p>
        </section>

        <section>
          <h2>Submissions</h2>
          <p>Your project submissions will appear here.</p>
        </section>

        <section>
          <h2>Messages</h2>
          <p>Communication with your evaluator will appear here.</p>
        </section>
      </main>
    </>
  );
}

export default CandidateDashboard;