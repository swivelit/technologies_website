import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <h2>{project.title}</h2>

      <p>{project.description}</p>

      <p>
        <strong>Technology:</strong> {project.technology}
      </p>

      <p>
        <strong>Difficulty:</strong> {project.difficulty}
      </p>

      <Link to={`/projects/${project.id}`} className="button">
        View Project
      </Link>
    </div>
  );
}

export default ProjectCard;