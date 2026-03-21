import './Spinner.css'

export default function Spinner({ size = 'md', fullPage = false }) {
  const spinner = <div className={`spinner spinner-${size}`} />
  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        {spinner}
      </div>
    )
  }
  return spinner
}
