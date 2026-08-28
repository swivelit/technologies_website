import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

function Projects() {
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "Build a complete e-commerce application.",
      technology: "React",
      difficulty: "Intermediate",
    },
    {
      id: 2,
      title: "AI Chatbot",
      description: "Build an AI-powered chatbot.",
      technology: "Python",
      difficulty: "Advanced",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="page">
        <h1>Explore Projects</h1>

        <p>
          Choose from industry-oriented projects and build
          practical experience.
        </p>

        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      </main>
    </>
  );
}

export default Projects;