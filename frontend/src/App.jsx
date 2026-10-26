import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  FolderCheck,
  FolderOpen,
  HardDrive,
  Home,
  LayoutDashboard,
  Leaf,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import './App.css'

const initialFiles = [
  { id: 1, name: 'Project proposal.pdf', type: 'PDF', category: 'Documents', size: '2.4 MB', date: 'Today', icon: FileText },
  { id: 2, name: 'Summer memories.png', type: 'Image', category: 'Images', size: '4.8 MB', date: 'Yesterday', icon: FileImage },
  { id: 3, name: 'Meeting notes.docx', type: 'Document', category: 'Documents', size: '840 KB', date: 'Yesterday', icon: FileText },
  { id: 4, name: 'Weekend playlist.mp3', type: 'Audio', category: 'Audio', size: '8.1 MB', date: 'Oct 18', icon: FileAudio },
  { id: 5, name: 'Website demo.mp4', type: 'Video', category: 'Videos', size: '24 MB', date: 'Oct 17', icon: FileVideo },
  { id: 6, name: 'Design resources.zip', type: 'Archive', category: 'Archives', size: '12 MB', date: 'Oct 16', icon: FileArchive },
]

const suggestions = [
  { id: 1, name: 'Project proposal.pdf', from: 'Downloads', to: 'Documents', reason: 'Looks like a project or work document.', icon: FileText },
  { id: 2, name: 'Summer memories.png', from: 'Desktop', to: 'Images', reason: 'Image file detected from its file extension.', icon: FileImage },
  { id: 3, name: 'Meeting notes.docx', from: 'Downloads', to: 'Documents', reason: 'Document format commonly used for notes.', icon: FileText },
  { id: 4, name: 'Website demo.mp4', from: 'Desktop', to: 'Videos', reason: 'Video file detected from its file extension.', icon: FileVideo },
]

const categories = [
  { name: 'Documents', count: 24, size: '186 MB', icon: FileText, color: 'sage' },
  { name: 'Images', count: 18, size: '342 MB', icon: FileImage, color: 'peach' },
  { name: 'Videos', count: 8, size: '1.2 GB', icon: FileVideo, color: 'lavender' },
  { name: 'Audio', count: 12, size: '94 MB', icon: FileAudio, color: 'yellow' },
]

function App() {
  const [page, setPage] = useState('home')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All files')
  const [files, setFiles] = useState(initialFiles)
  const [selected, setSelected] = useState([1, 2, 3, 4])
  const [approved, setApproved] = useState([])
  const [toast, setToast] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)

  const activeSuggestions =
    aiSuggestions.length > 0 ? aiSuggestions : suggestions

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const generateAiSuggestions = async () => {
    setAiLoading(true)

    try {
      const response = await fetch(
        'https://filosort-ai.onrender.com/organize-suggestions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: files.map((file) => ({
              name: file.name,
              extension: file.name.includes('.')
                ? `.${file.name.split('.').pop()}`
                : '',
            })),
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`)
      }

      const data = await response.json()

      setAiSuggestions(
        data.suggestions.map((item, index) => ({
          id: `ai-${index}`,
          name: item.file_name,
          from: 'Current location unknown',
          to: item.suggested_folder,
          reason: item.reason,
          category: item.category,
          icon:
            item.category === 'Images'
              ? FileImage
              : item.category === 'Videos'
                ? FileVideo
                : item.category === 'Audio'
                  ? FileAudio
                  : FileText,
        })),
      )

      setSelected([])
      notify('Fresh AI suggestions are ready to review.')
    } catch (error) {
      console.error('FiloSort AI error:', error)
      notify('Could not reach the AI backend. Check that it is running.')
    } finally {
      setAiLoading(false)
    }
  }

  const navigate = (nextPage) => {
    setPage(nextPage)
    setMobileMenu(false)
    setSearch('')
  }

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'All files' || file.category === filter
      return matchesSearch && matchesFilter
    })
  }, [files, search, filter])

  const toggleSuggestion = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const approveSuggestions = () => {
    if (!selected.length) {
      notify('Select at least one suggestion first.')
      return
    }

    const approvedItems = activeSuggestions.filter(
      (item) => selected.includes(item.id),
    )

    setApproved((current) => [
      ...current,
      ...approvedItems.filter(
        (item) => !current.some((old) => old.id === item.id),
      ),
    ])

    setFiles((current) =>
      current.map((file) => {
        const suggestion = approvedItems.find((item) => item.name === file.name)
        return suggestion ? { ...file, category: suggestion.to } : file
      }),
    )

    notify(`${approvedItems.length} suggestion${approvedItems.length === 1 ? '' : 's'} approved in this demo.`)
    setPage('dashboard')
  }

  const pageTitles = {
    home: 'A little more room to breathe.',
    dashboard: 'Your files, feeling lighter.',
    files: 'Everything in its place.',
    organizer: 'A calmer kind of cleanup.',
    settings: 'Your space, your rules.',
    help: 'Here to help.',
  }

  return (
    <div className="app-shell">
      {page === 'home' ? (
        <HomePage onStart={() => navigate('dashboard')} onNavigate={navigate} />
      ) : (
        <div className="workspace">
          <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
            <div className="brand">
              <div className="brand-mark"><Leaf size={22} /></div>
              <span>filosort<span className="brand-ai"> AI</span></span>
              <button className="icon-button sidebar-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={19} /></button>
            </div>

            <div className="sidebar-label">WORKSPACE</div>
            <nav className="nav-list" aria-label="Main navigation">
              <NavItem icon={LayoutDashboard} label="Dashboard" active={page === 'dashboard'} onClick={() => navigate('dashboard')} />
              <NavItem icon={FolderOpen} label="My files" active={page === 'files'} onClick={() => navigate('files')} />
              <NavItem icon={Sparkles} label="AI organizer" active={page === 'organizer'} onClick={() => navigate('organizer')} badge="NEW" />
            </nav>

            <div className="sidebar-label categories-label">YOUR CATEGORIES</div>
            <nav className="nav-list">
              {categories.map((category) => (
                <button className="category-nav" key={category.name} onClick={() => { setFilter(category.name); navigate('files') }}>
                  <span className={`mini-folder ${category.color}`}><Folder size={15} /></span>
                  <span>{category.name}</span>
                  <span className="nav-count">{category.count}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-spacer" />
            <div className="privacy-card">
              <div className="privacy-icon"><ShieldCheck size={19} /></div>
              <strong>Your files stay yours.</strong>
              <p>Designed with privacy in mind. Review every change before you approve it.</p>
              <span><span className="status-dot" /> Privacy-first design</span>
            </div>
            <nav className="nav-list bottom-nav">
              <NavItem icon={Settings} label="Settings" active={page === 'settings'} onClick={() => navigate('settings')} />
              <NavItem icon={CircleHelp} label="Help & support" active={page === 'help'} onClick={() => navigate('help')} />
            </nav>
            <div className="profile">
              <div className="avatar">F</div>
              <div className="profile-copy"><strong>Your workspace</strong><span>Personal space</span></div>
              <MoreHorizontal size={20} className="muted-icon" />
            </div>
          </aside>

          {mobileMenu && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileMenu(false)} />}

          <main className="main-panel">
            <header className="topbar">
              <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={21} /></button>
              <div className="breadcrumb"><span>Workspace</span><ChevronRight size={15} /><strong>{page === 'files' ? 'My files' : page === 'organizer' ? 'AI organizer' : pageTitles[page] || 'Dashboard'}</strong></div>
              <div className="topbar-right">
                <span className="local-badge"><span className="status-dot" /> Your space</span>
                <button className="icon-button" aria-label="Help" onClick={() => navigate('help')}><CircleHelp size={19} /></button>
                <button className="avatar avatar-small" onClick={() => navigate('settings')} aria-label="Open settings">F</button>
              </div>
            </header>

            <div className="page-content">
              {page === 'dashboard' && <Dashboard files={files} onNavigate={navigate} onNotify={notify} />}
              {page === 'files' && <FilesPage files={filteredFiles} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />}
              {page === 'organizer' && (
                <OrganizerPage
                  selected={selected}
                  onToggle={toggleSuggestion}
                  onApprove={approveSuggestions}
                  approved={approved}
                  suggestions={activeSuggestions}
                  onGenerate={generateAiSuggestions}
                  loading={aiLoading}
                />
              )}
              {page === 'settings' && <SettingsPage onNotify={notify} />}
              {page === 'help' && <HelpPage onNavigate={navigate} />}
            </div>
            <footer className="app-footer"><span>Made for a little more digital breathing room.</span><span><ShieldCheck size={14} /> Privacy-first by design</span></footer>
          </main>
        </div>
      )}
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </button>
  )
}

function HomePage({ onStart, onNavigate }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <button className="brand landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-mark"><Leaf size={22} /></span>
          <span>filosort<span className="brand-ai"> AI</span></span>
        </button>
        <nav className="landing-links">
          <a href="#how-it-works">How it works</a>
          <a href="#why-filosort">Why FiloSort</a>
        </nav>
        <button className="button button-dark nav-cta" onClick={onStart}>Open workspace <ArrowUpRight size={16} /></button>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-spark"><Sparkles size={14} /></span> A FRESH START FOR YOUR FILES</div>
          <h1>A little less <em>clutter.</em><br />A lot more <span>clarity.</span></h1>
          <p className="hero-description">Your digital space deserves a deep breath, too. FiloSort helps you bring a little order to your files, without giving up control.</p>
          <div className="hero-actions">
            <button className="button button-dark button-large" onClick={onStart}>Get started <ArrowRight size={17} /></button>
            <a className="text-link" href="#how-it-works">Take a little tour <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero-trust"><span className="trust-icon"><ShieldCheck size={16} /></span><span>Thoughtful by design.</span><i /> <span>You're always in control.</span></div>
        </div>

        <div className="hero-art" aria-label="Illustration of an organized workspace">
          <div className="art-sun" />
          <div className="art-blob" />
          <div className="art-plant plant-one"><span /><span /><span /><i /></div>
          <div className="art-plant plant-two"><span /><span /><i /></div>
          <div className="art-window">
            <div className="window-top"><span /><span /><span /><div>your digital garden</div><MoreHorizontal size={17} /></div>
            <div className="window-heading"><span>Good things grow here.</span><div className="window-search"><Search size={13} /> Find a file...</div></div>
            <div className="art-folders">
              <div className="art-folder folder-sage"><span><Folder size={23} /></span><b>Documents</b><small>24 files</small></div>
              <div className="art-folder folder-peach"><span><FileImage size={23} /></span><b>Memories</b><small>18 files</small></div>
              <div className="art-folder folder-lavender"><span><FileText size={23} /></span><b>Projects</b><small>12 files</small></div>
            </div>
            <div className="art-bottom"><div className="art-leaf"><Leaf size={19} /></div><div><b>Looking good!</b><small>Your space is coming together.</small></div><CheckCircle2 size={20} /></div>
          </div>
          <div className="floating-note note-top"><span className="note-check"><Check size={13} /></span><div><b>A little more organized</b><small>One step at a time</small></div></div>
          <div className="floating-note note-bottom"><div className="note-spark"><Sparkles size={17} /></div><div><b>Your files, your choice</b><small>Review before changes</small></div></div>
          <div className="art-ground" />
        </div>
      </section>

      <section className="landing-perks" id="why-filosort">
        <div className="perk"><span className="perk-icon"><ShieldCheck size={20} /></span><div><b>Privacy comes first</b><p>Your files shouldn't have to leave your space.</p></div></div>
        <div className="perk"><span className="perk-icon perk-yellow"><Sparkles size={20} /></span><div><b>A little help from AI</b><p>Get thoughtful suggestions, not surprises.</p></div></div>
        <div className="perk"><span className="perk-icon perk-peach"><FolderCheck size={20} /></span><div><b>You stay in control</b><p>Nothing moves without your approval.</p></div></div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-heading"><div className="eyebrow">SIMPLE, ON PURPOSE</div><h2>Good order. No overwhelm.</h2><p>A calmer file routine, broken into small, manageable steps.</p></div>
        <div className="steps-grid">
          <div className="step-card"><span className="step-number">01</span><div className="step-icon"><FolderOpen size={22} /></div><h3>Take a look around</h3><p>Start by seeing what you have. No changes, just a clearer picture.</p></div>
          <div className="step-card"><span className="step-number">02</span><div className="step-icon"><Sparkles size={22} /></div><h3>Get gentle suggestions</h3><p>Let the organizer suggest where your files might belong.</p></div>
          <div className="step-card"><span className="step-number">03</span><div className="step-icon"><CheckCircle2 size={22} /></div><h3>Choose what feels right</h3><p>Review each suggestion and decide what to approve.</p></div>
        </div>
        <div className="closing-banner"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Your files can feel lighter.</h2><p>Start small. Make it yours.</p></div><button className="button button-dark" onClick={onStart}>Enter your workspace <ArrowRight size={16} /></button></div>
      </section>
      <footer className="landing-footer"><div className="brand"><span className="brand-mark"><Leaf size={20} /></span><span>filosort<span className="brand-ai"> AI</span></span></div><span>A little more digital breathing room.</span><button className="footer-link" onClick={() => onNavigate('help')}>Need a hand? <ArrowUpRight size={14} /></button></footer>
    </div>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  )
}

function Dashboard({ files, onNavigate, onNotify }) {
  return (
    <>
      <PageHeading eyebrow="YOUR LITTLE CORNER OF THE WORLD" title="Hello again. 🌱" description="Here's a gentle look at how your digital space is doing." action={<button className="button button-dark" onClick={() => onNavigate('organizer')}><Sparkles size={16} /> Organize files</button>} />
      <section className="welcome-banner">
        <div className="welcome-text"><span className="welcome-kicker"><Leaf size={14} /> A FRESH START, AT YOUR PACE</span><h2>Make room for what<br />matters most.</h2><p>A few thoughtful steps can make your digital space feel a whole lot better.</p><button className="button button-light" onClick={() => onNavigate('organizer')}>Let's tidy up <ArrowRight size={16} /></button></div>
        <div className="welcome-decoration"><div className="sun-disc" /><div className="decor-plant"><span /><span /><span /><i /></div><div className="decor-pot" /><div className="decor-book book-one" /><div className="decor-book book-two" /><div className="decor-book book-three" /><div className="banner-spark spark-one">✳</div><div className="banner-spark spark-two">✦</div></div>
        <div className="banner-label">SMALL STEPS, LOVELY SPACES</div>
      </section>

      <div className="section-title-row"><div><h2>Your space at a glance</h2><p>A little overview to help you get started.</p></div><span className="subtle-label"><HardDrive size={14} /> Demo overview</span></div>
      <div className="stats-grid">
        <StatCard label="Files in your space" value="62" note="Across all categories" icon={File} color="sage" trend="+ 6 this week" />
        <StatCard label="Space represented" value="1.8 GB" note="Illustrative sample data" icon={HardDrive} color="peach" trend="Room to grow" />
        <StatCard label="Needing a home" value="12" note="Could use a quick review" icon={FolderOpen} color="lavender" trend="Worth a look" />
        <StatCard label="Organized" value="78%" note="Sample progress indicator" icon={FolderCheck} color="yellow" trend="Looking good" />
      </div>

      <div className="dashboard-lower">
        <section className="panel category-panel"><div className="panel-heading"><div><h2>Your categories</h2><p>Everything has a place.</p></div><button className="icon-button" onClick={() => onNavigate('files')} aria-label="View files"><ArrowUpRight size={18} /></button></div><div className="category-grid">{categories.map((item) => { const Icon = item.icon; return <button className="category-card" key={item.name} onClick={() => onNavigate('files')}><span className={`category-icon ${item.color}`}><Icon size={20} /></span><span className="category-name">{item.name}</span><strong>{item.count} <small>files</small></strong><span className="category-size">{item.size}</span></button> })}</div></section>
        <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recently seen</h2><p>A peek at your files.</p></div><button className="text-link" onClick={() => onNavigate('files')}>View all <ArrowRight size={15} /></button></div><div className="recent-list">{files.slice(0, 4).map((file) => { const Icon = file.icon; return <div className="recent-item" key={file.id}><span className="file-type-icon"><Icon size={18} /></span><div className="recent-file-name"><b>{file.name}</b><small>{file.category} · {file.size}</small></div><span className="file-date">{file.date}</span></div> })}</div></section>
      </div>
      <section className="gentle-tip"><span className="tip-icon"><Sparkles size={19} /></span><div><b>A gentle reminder</b><p>You don't have to organize everything at once. Start with one small folder and go from there.</p></div><button className="text-link" onClick={() => { onNotify('One small step is still progress.'); }}>Got it <Check size={15} /></button></section>
    </>
  )
}

function StatCard({ label, value, note, icon: Icon, color, trend }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${color}`}><Icon size={19} /></span></div><strong className="stat-value">{value}</strong><p>{note}</p><div className="stat-trend"><span>{trend}</span><ArrowUpRight size={14} /></div></div>
}

function FilesPage({ files, search, setSearch, filter, setFilter }) {
  const filters = ['All files', 'Documents', 'Images', 'Videos', 'Audio', 'Archives']
  return <>
    <PageHeading eyebrow="YOUR DIGITAL SHELVES" title="My files" description="A simple view of the files in this demo workspace." action={<span className="demo-pill"><span className="status-dot" /> Sample files</span>} />
    <section className="panel files-panel">
      <div className="files-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a file..." aria-label="Search files" />{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</div><label className="filter-select"><span>Category</span><select value={filter} onChange={(event) => setFilter(event.target.value)}>{filters.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></label></div>
      <div className="files-table-wrap"><table className="files-table"><thead><tr><th>Name</th><th>Category</th><th>File size</th><th>Last seen</th><th></th></tr></thead><tbody>{files.map((file) => { const Icon = file.icon; return <tr key={file.id}><td><div className="table-file"><span className="file-type-icon"><Icon size={18} /></span><span><b>{file.name}</b><small>{file.type} file</small></span></div></td><td><span className="table-category"><Folder size={14} />{file.category}</span></td><td>{file.size}</td><td>{file.date}</td><td><button className="icon-button" aria-label={`More options for ${file.name}`} title="Demo action only"><MoreHorizontal size={18} /></button></td></tr>})}</tbody></table></div>
      {files.length === 0 && <div className="empty-state"><FolderOpen size={30} /><h3>No files found</h3><p>Try another search or category.</p></div>}
      <div className="table-footer"><span>Showing {files.length} sample file{files.length === 1 ? '' : 's'}</span><span>Demo data · No local files accessed</span></div>
    </section>
    <div className="files-note"><ShieldCheck size={18} /><p><b>A note about your privacy</b><br />These are example entries, not files from your computer. Real file access will be connected through the local backend later.</p></div>
  </>
}

function OrganizerPage({
  selected,
  onToggle,
  onApprove,
  approved,
  suggestions,
  onGenerate,
  loading,
}) {
  return <>
    <PageHeading
      eyebrow="A LITTLE HELP FROM AI"
      title="AI organizer"
      description="Review AI suggestions before approving any changes."
      action={
        <button className="button button-dark" onClick={onGenerate} disabled={loading}>
          <Sparkles size={14} />
          {loading ? 'Generating...' : 'Generate AI suggestions'}
        </button>
      }
    />
    <section className="organizer-intro"><div className="organizer-intro-icon"><Sparkles size={24} /></div><div><h2>A little order, one file at a time.</h2><p>FiloSort can suggest where files belong. You choose what happens next — nothing is moved automatically.</p></div><div className="intro-decoration"><Leaf size={46} /></div></section>
    <div className="review-summary"><div><span className="summary-number">{suggestions.filter((item) => selected.includes(item.id)).length}</span><span>suggestions selected</span></div><div><span className="summary-number">{suggestions.length}</span><span>suggestions</span></div><div><span className="summary-number">{approved.length}</span><span>approved in demo</span></div></div>
    <section className="panel suggestions-panel"><div className="panel-heading"><div><h2>Suggested homes</h2><p>Choose which suggestions you'd like to approve.</p></div></div>
      <div className="suggestion-list">{suggestions.map((item) => { const Icon = item.icon || FileText; const isSelected = selected.includes(item.id); const isApproved = approved.some((old) => old.id === item.id); return <label className={`suggestion-row ${isSelected ? 'suggestion-selected' : ''}`} key={item.id}><input type="checkbox" checked={isSelected} onChange={() => onToggle(item.id)} /><span className="suggestion-file-icon"><Icon size={20} /></span><span className="suggestion-main"><b>{item.name}</b><small>{item.reason}</small><span className="suggestion-path"><span>{item.from}</span><ArrowRight size={14} /><strong>{item.to}</strong></span></span><span className={`suggestion-status ${isApproved ? 'approved' : ''}`}>{isApproved ? <><Check size={13} /> Approved</> : 'Suggested'}</span></label> })}</div>
      <div className="suggestion-footer"><span><ShieldCheck size={16} /> Review before approving. Always.</span><button className="button button-dark" onClick={onApprove}><Check size={16} /> Approve selected ({selected.length})</button></div>
    </section>
    <p className="demo-disclaimer">AI suggestions use the displayed file names and extensions. Approving them updates this demo only; files on your computer are not moved or modified.</p>
  </>
}

function SettingsPage({ onNotify }) {
  const [localMode, setLocalMode] = useState(true)
  const [confirmMoves, setConfirmMoves] = useState(true)
  return <>
    <PageHeading eyebrow="MAKE IT YOURS" title="Settings" description="Simple choices for a more comfortable workspace." />
    <section className="panel settings-panel"><div className="settings-heading"><span className="settings-icon"><ShieldCheck size={21} /></span><div><h2>Privacy & control</h2><p>Choose how FiloSort should approach your files.</p></div></div>
      <SettingRow title="Prefer local AI processing" description="Designed to keep AI processing on your own device when supported." checked={localMode} onChange={setLocalMode} />
      <SettingRow title="Ask before organizing" description="Review suggested changes before anything is moved." checked={confirmMoves} onChange={setConfirmMoves} />
      <div className="settings-note"><ShieldCheck size={17} /><span>These are interface preferences for the demo. Local processing and real file operations are not connected yet.</span></div>
      <button className="button button-dark settings-save" onClick={() => onNotify('Your demo preferences are updated.')}>Save preferences <Check size={16} /></button>
    </section>
    <section className="panel about-panel"><div className="settings-heading"><span className="settings-icon"><Leaf size={21} /></span><div><h2>About FiloSort AI</h2><p>A privacy-first file organization project.</p></div></div><div className="about-detail"><span>Current version</span><strong>Frontend preview</strong></div><div className="about-detail"><span>AI engine</span><strong>Local Ollama / Gemma planned</strong></div><div className="about-detail"><span>File operations</span><strong>Not connected yet</strong></div></section>
  </>
}

function SettingRow({ title, description, checked, onChange }) {
  return <div className="setting-row"><div><b>{title}</b><p>{description}</p></div><button role="switch" aria-checked={checked} className={`toggle ${checked ? 'toggle-on' : ''}`} onClick={() => onChange(!checked)}><span /></button></div>
}

function HelpPage({ onNavigate }) {
  return <>
    <PageHeading eyebrow="A FRIENDLY LITTLE GUIDE" title="Help & support" description="A few answers to help you find your way around." />
    <section className="panel help-panel"><div className="help-item"><span className="help-icon"><LayoutDashboard size={20} /></span><div><h3>What is the dashboard showing?</h3><p>The counts and file sizes are sample data for the UI preview. They are not a scan of your computer.</p></div></div><div className="help-item"><span className="help-icon"><Sparkles size={20} /></span><div><h3>Does the AI organizer move files?</h3><p>Not in this frontend preview. You can select and approve example suggestions, but real file operations need the local backend.</p></div></div><div className="help-item"><span className="help-icon"><ShieldCheck size={20} /></span><div><h3>Are my personal files accessed?</h3><p>No. This version only displays example data and does not access your local folders.</p></div></div><div className="help-item"><span className="help-icon"><Clock3 size={20} /></span><div><h3>What comes next?</h3><p>The next development step is connecting a local FastAPI backend and Ollama so file scanning can be added carefully.</p></div></div></section>
    <div className="help-cta"><div><h2>Ready to take a look around?</h2><p>Your workspace is waiting.</p></div><button className="button button-dark" onClick={() => onNavigate('dashboard')}>Back to dashboard <ArrowRight size={16} /></button></div>
  </>
}

export default App