import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { hasProtectedPassword, resolveProjectAccessModeFromPassword } from '../utils/projectAccess'
import logoImage from '../assets/Logo.png'
import '../styles/IdeaListPage.css'

export default function IdeaListPage() {
  const navigate = useNavigate()
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newReadOnly, setNewReadOnly] = useState(false)
  const { projects, createProject, deleteProject, goToEditor, initializeProjects } = useProjectStore()

  useEffect(() => {
    initializeProjects()
  }, [initializeProjects])

  const handleCreateProject = async () => {
    if (!newTitle.trim()) return

    const projectId = await createProject({
      title: newTitle,
      subtitle: newSubtitle,
      category: newCategory,
      author: newAuthor,
      readOnly: newReadOnly,
    })

    setNewTitle('')
    setNewSubtitle('')
    setNewCategory('')
    setNewAuthor('')
    setNewReadOnly(false)
    navigate(`/editor/${projectId}`)
  }

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    const project = projects.find((entry) => entry.id === projectId)
    if (!project) {
      return
    }

    if (hasProtectedPassword(project)) {
      const input = window.prompt('輸入密碼以刪除專案')
      if (input === null) {
        return
      }

      const mode = await resolveProjectAccessModeFromPassword(project, input)
      if (!mode) {
        window.alert('密碼錯誤，無法刪除專案。')
        return
      }
    }

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
        <input
          type="text"
          placeholder="Category（選填）"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Author（選填）"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          className="input-field"
        />
        {/* <label className="create-checkbox-row">
          <input
            type="checkbox"
            checked={newReadOnly}
            onChange={(e) => setNewReadOnly(e.target.checked)}
          />
          <span>Read Only（無密碼時唯讀）</span>
        </label> */}
        <button onClick={() => void handleCreateProject()} className="create-button">
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
                  <h3>{project.snapshot.ideaSpace.title || project.title}</h3>
                  <button
                    className="delete-btn"
                    onClick={(e) => void handleDeleteProject(e, project.id)}
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
                {(project.snapshot.ideaSpace.subtitle || project.subtitle) && <p className="project-subtitle">{project.snapshot.ideaSpace.subtitle || project.subtitle}</p>}
                <div className="project-card-tags">
                  {project.snapshot.ideaSpace.password ? <span className="project-tag">🗝️</span> : null}
                  {project.snapshot.ideaSpace.category ? (
                    <span className="project-tag">#{project.snapshot.ideaSpace.category}</span>
                  ) : null}
                  {project.snapshot.ideaSpace.author ? (
                    <span className="project-tag">by {project.snapshot.ideaSpace.author}</span>
                  ) : null}
                  {project.snapshot.ideaSpace.readOnly ? <span className="project-tag">Read Only</span> : null}
                </div>
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
