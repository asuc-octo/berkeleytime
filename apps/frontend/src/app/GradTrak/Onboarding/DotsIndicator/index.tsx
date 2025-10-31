import "./DotsIndicator.scss";

type DotsIndicatorProps = {
  currentPage: number;
  totalPages: number;
};

export default function DotsIndicator({
  currentPage,
  totalPages,
}: DotsIndicatorProps) {
  return (
    <div className="dots-container">
      {Array.from({ length: totalPages }).map((_, index) => (
        <span
          key={index}
          className={`dot ${index === currentPage ? "active" : ""}`}
        ></span>
      ))}
    </div>
  );
}
