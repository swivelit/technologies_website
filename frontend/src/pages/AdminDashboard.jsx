import Navbar from "../components/Navbar";

function AdminDashboard() {
  return (
    <>
      <Navbar />

      <main className="page">
        <h1>Admin Dashboard</h1>

        <section>
          <h2>Users</h2>
          <p>User management will appear here.</p>
        </section>

        <section>
          <h2>Projects</h2>
          <p>Project management will appear here.</p>
        </section>

        <section>
          <h2>Enrollments</h2>
          <p>Enrollment management will appear here.</p>
        </section>

        <section>
          <h2>Payments</h2>
          <p>Payment information will appear here.</p>
        </section>

        <section>
          <h2>Evaluations</h2>
          <p>Evaluation management will appear here.</p>
        </section>
      </main>
    </>
  );
}

export default AdminDashboard;