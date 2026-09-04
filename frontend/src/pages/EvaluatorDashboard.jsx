import Navbar from "../components/Navbar";

function EvaluatorDashboard() {
  return (
    <>
      <Navbar />

      <main className="page">
        <h1>Evaluator Dashboard</h1>

        <section>
          <h2>Assigned Projects</h2>
          <p>Projects assigned to you will appear here.</p>
        </section>

        <section>
          <h2>Pending Evaluations</h2>
          <p>Submissions waiting for evaluation will appear here.</p>
        </section>

        <section>
          <h2>Messages</h2>
          <p>Communication with candidates will appear here.</p>
        </section>
      </main>
    </>
  );
}

export default EvaluatorDashboard;
