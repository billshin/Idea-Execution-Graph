import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import logoImage from '../assets/Logo.png'
import '../styles/IdeaListPage.css'

export default function IdeaListPage() {
  const navigate = useNavigate()
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const { projects, createProject, deleteProject, goToEditor, initializeProjects } = useProjectStore()

  useEffect(() => {
    initializeProjects()
  }, [initializeProjects])

  const handleCreateProject = () => {
    if (!newTitle.trim()) return
    const projectId = createProject(newTitle, newSubtitle)
    setNewTitle('')
    setNewSubtitle('')
    navigate(`/editor/${projectId}`)
  }

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    if (confirm('確定刪除這個想法嗎？')) {
      deleteProject(projectId)
    }
  }

  const handleSelectProject = (projectId: string) => {
    goToEditor(projectId)
    navigate(`/editor/${projectId}`)
  }

  return (
    <div className="idea-list-page">
      <div className="list-header">
        <img className="list-page-logo" src={logoImage} alt="Idea Execution Graph" />
        {/* <h1>📘 想法列表</h1> */}
      </div>

      <div className="create-section">
        <h2>建立新想法</h2>
        <input
          type="text"
          placeholder="想法標題"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
          className="input-field"
        />
        <input
          type="text"
          placeholder="想法描述（選填）"
          value={newSubtitle}
          onChange={(e) => setNewSubtitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
          className="input-field"
        />
        <button onClick={handleCreateProject} className="create-button">
          + 建立想法
        </button>
      </div>

      <div className="projects-section">
        <h2>我的想法</h2>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>還沒有想法，開始建立第一個吧！</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleSelectProject(project.id)}
              >
                <div className="project-card-header">
                  <h3>{project.title}</h3>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
                {project.subtitle && <p className="project-subtitle">{project.subtitle}</p>}
                <div className="project-meta">
                  <span className="project-date">
                    建立: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
