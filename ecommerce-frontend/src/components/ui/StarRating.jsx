import './StarRating.css'

export default function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className={`star-rating ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= value ? 'filled' : ''}`}
          onClick={!readonly ? () => onChange(star) : undefined}
          disabled={readonly}
          aria-label={`${star} yıldız`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
